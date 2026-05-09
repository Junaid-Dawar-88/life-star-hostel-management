"use client";

import NiceModal from "@ebay/nice-modal-react";
import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontalIcon } from "lucide-react";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsJson,
	parseAsString,
	useQueryState,
} from "nuqs";
import * as React from "react";
import { toast } from "sonner";
import { OrganizationBulkActions } from "@/components/admin/organizations/organization-bulk-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { OrganizationLogo } from "@/components/organization/organization-logo";
import { Button } from "@/components/ui/button";
import {
	createSelectionColumn,
	DataTable,
	type FilterConfig,
	SortableColumnHeader,
} from "@/components/ui/custom/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appConfig } from "@/config/app.config";
import { useTableSelection } from "@/hooks/use-table-selection";
import { OrganizationSortField } from "@/schemas/admin-organization-schemas";
import { trpc } from "@/trpc/client";

const DEFAULT_SORTING: SortingState = [{ id: "name", desc: false }];

type Organization = {
	id: string;
	name: string;
	logo: string | null;
	createdAt: Date;
	metadata: string | null;
	membersCount: number;
	pendingInvites: number;
};

export function OrganizationsTable(): React.JSX.Element {
	const [searchQuery, setSearchQuery] = useQueryState(
		"query",
		parseAsString.withDefault("").withOptions({ shallow: true }),
	);

	const [pageIndex, setPageIndex] = useQueryState(
		"pageIndex",
		parseAsInteger.withDefault(0).withOptions({ shallow: true }),
	);

	const [pageSize, setPageSize] = useQueryState(
		"pageSize",
		parseAsInteger
			.withDefault(appConfig.pagination.defaultLimit)
			.withOptions({ shallow: true }),
	);

	const [membersCountFilter, setMembersCountFilter] = useQueryState(
		"membersCount",
		parseAsArrayOf(parseAsString)
			.withDefault([])
			.withOptions({ shallow: true }),
	);

	const [createdAtFilter, setCreatedAtFilter] = useQueryState(
		"createdAt",
		parseAsArrayOf(parseAsString)
			.withDefault([])
			.withOptions({ shallow: true }),
	);

	const [sorting, setSorting] = useQueryState<SortingState>(
		"sort",
		parseAsJson<SortingState>((value) => {
			if (!Array.isArray(value)) return DEFAULT_SORTING;
			return value.filter(
				(item) =>
					item &&
					typeof item === "object" &&
					"id" in item &&
					typeof item.desc === "boolean",
			) as SortingState;
		})
			.withDefault(DEFAULT_SORTING)
			.withOptions({ shallow: true }),
	);

	const utils = trpc.useUtils();
	const deleteOrganizationMutation =
		trpc.admin.organization.delete.useMutation();

	const columnFilters: ColumnFiltersState = React.useMemo(() => {
		const filters: ColumnFiltersState = [];
		if (membersCountFilter?.length)
			filters.push({ id: "membersCount", value: membersCountFilter });
		if (createdAtFilter?.length)
			filters.push({ id: "createdAt", value: createdAtFilter });
		return filters;
	}, [membersCountFilter, createdAtFilter]);

	const handleFiltersChange = (filters: ColumnFiltersState): void => {
		const getFilterValue = (id: string): string[] => {
			const filter = filters.find((f) => f.id === id);
			return Array.isArray(filter?.value) ? (filter.value as string[]) : [];
		};
		setMembersCountFilter(getFilterValue("membersCount"));
		setCreatedAtFilter(getFilterValue("createdAt"));
		if (pageIndex !== 0) setPageIndex(0);
	};

	const handleSortingChange = (newSorting: SortingState): void => {
		setSorting(newSorting.length > 0 ? newSorting : DEFAULT_SORTING);
		if (pageIndex !== 0) setPageIndex(0);
	};

	const sortParams = React.useMemo(() => {
		const fallbackSort = { id: "name", desc: false } as const;
		const currentSort = sorting?.[0] ?? DEFAULT_SORTING[0] ?? fallbackSort;
		const sortBy = OrganizationSortField.options.includes(
			currentSort.id as OrganizationSortField,
		)
			? (currentSort.id as OrganizationSortField)
			: "name";
		const sortOrder = currentSort.desc ? ("desc" as const) : ("asc" as const);
		return { sortBy, sortOrder };
	}, [sorting]);

	const { data, isPending } = trpc.admin.organization.list.useQuery(
		{
			limit: pageSize || appConfig.pagination.defaultLimit,
			offset:
				(pageIndex || 0) * (pageSize || appConfig.pagination.defaultLimit),
			query: searchQuery || "",
			sortBy: sortParams.sortBy,
			sortOrder: sortParams.sortOrder,
			filters: {
				membersCount: (membersCountFilter || []) as (
					| "0"
					| "1-5"
					| "6-10"
					| "11+"
				)[],
				createdAt: (createdAtFilter || []) as (
					| "today"
					| "this-week"
					| "this-month"
					| "older"
				)[],
			},
		},
		{ placeholderData: (prev) => prev },
	);

	const { rowSelection, setRowSelection, clearSelection } = useTableSelection({
		total: data?.total,
		pageIndex,
		pageSize,
		setPageIndex,
	});

	const handleSearchQueryChange = (value: string): void => {
		if (value !== searchQuery) {
			setSearchQuery(value);
			if (pageIndex !== 0) setPageIndex(0);
		}
	};

	const columns: ColumnDef<Organization>[] = [
		createSelectionColumn<Organization>(),
		{
			accessorKey: "name",
			header: ({ column }) => (
				<SortableColumnHeader column={column} title="Organization" />
			),
			cell: ({
				row: {
					original: { name, logo },
				},
			}) => (
				<div className="flex items-center gap-2 py-2">
					<OrganizationLogo className="size-6" name={name} src={logo} />
					<div className="font-medium text-foreground">{name}</div>
				</div>
			),
		},
		{
			accessorKey: "membersCount",
			header: ({ column }) => (
				<SortableColumnHeader column={column} title="Members" />
			),
			cell: ({
				row: {
					original: { membersCount },
				},
			}) => (
				<div className="text-foreground/80">
					{membersCount} {membersCount === 1 ? "member" : "members"}
				</div>
			),
			filterFn: (row, id, value) => {
				const count = row.getValue(id) as number;
				return value.some((range: string) => {
					switch (range) {
						case "0":
							return count === 0;
						case "1-5":
							return count >= 1 && count <= 5;
						case "6-10":
							return count >= 6 && count <= 10;
						case "11+":
							return count > 10;
						default:
							return false;
					}
				});
			},
		},
		{
			accessorKey: "pendingInvites",
			enableSorting: false,
			header: () => (
				<div className="font-medium text-foreground text-xs text-nowrap">
					Pending Invites
				</div>
			),
			cell: ({ row }) => (
				<div className="text-foreground/80 text-xs">
					{row.original.pendingInvites}
				</div>
			),
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<SortableColumnHeader column={column} title="Created" />
			),
			cell: ({
				row: {
					original: { createdAt },
				},
			}) => (
				<div className="text-foreground/80">
					{format(createdAt, "dd MMM, yyyy")}
				</div>
			),
			filterFn: (row, id, value) => {
				const date = row.getValue(id) as Date;
				const now = new Date();
				return value.some((range: string) => {
					switch (range) {
						case "today": {
							const todayStart = new Date(
								now.getFullYear(),
								now.getMonth(),
								now.getDate(),
							);
							const todayEnd = new Date(
								now.getFullYear(),
								now.getMonth(),
								now.getDate() + 1,
							);
							return date >= todayStart && date < todayEnd;
						}
						case "this-week": {
							const weekStart = new Date(now);
							weekStart.setDate(now.getDate() - now.getDay());
							weekStart.setHours(0, 0, 0, 0);
							return date >= weekStart;
						}
						case "this-month": {
							const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
							monthStart.setHours(0, 0, 0, 0);
							return date >= monthStart;
						}
						case "older": {
							const monthAgo = new Date(
								now.getFullYear(),
								now.getMonth() - 1,
								now.getDate(),
							);
							monthAgo.setHours(23, 59, 59, 999);
							return date <= monthAgo;
						}
						default:
							return false;
					}
				});
			},
		},
		{
			id: "actions",
			enableSorting: false,
			cell: ({ row }) => {
				const { id, name } = row.original;
				return (
					<div className="flex justify-end">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
									size="icon"
									variant="ghost"
								>
									<MoreHorizontalIcon className="shrink-0" />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={() => {
										NiceModal.show(ConfirmationModal, {
											title: "Delete organization",
											message:
												"Are you sure you want to delete this organization? This action cannot be undone.",
											confirmLabel: "Delete",
											destructive: true,
											onConfirm: async () => {
												await deleteOrganizationMutation.mutateAsync(
													{ id },
													{
														onSuccess: () => {
															toast.success(
																"Organization has been deleted successfully!",
															);
															utils.organization.get.invalidate();
															utils.organization.list.invalidate();
															utils.admin.organization.list.invalidate();
														},
														onError: () => {
															toast.error(
																"Organization could not be deleted. Please try again.",
															);
														},
													},
												);
											},
										});
									}}
									variant="destructive"
								>
									Delete {name}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
		},
	];

	const organizationFilters: FilterConfig[] = [
		{
			key: "membersCount",
			title: "Members",
			options: [
				{ value: "0", label: "0 members" },
				{ value: "1-5", label: "1-5 members" },
				{ value: "6-10", label: "6-10 members" },
				{ value: "11+", label: "11+ members" },
			],
		},
		{
			key: "createdAt",
			title: "Created",
			options: [
				{ value: "today", label: "Today" },
				{ value: "this-week", label: "This week" },
				{ value: "this-month", label: "This month" },
				{ value: "older", label: "Older" },
			],
		},
	];

	return (
		<DataTable
			columnFilters={columnFilters}
			columns={columns}
			data={data?.organizations || []}
			defaultSorting={DEFAULT_SORTING}
			emptyMessage="No organization found."
			enableFilters
			enablePagination
			enableRowSelection
			enableSearch
			filters={organizationFilters}
			loading={isPending}
			onFiltersChange={handleFiltersChange}
			onPageIndexChange={setPageIndex}
			onPageSizeChange={setPageSize}
			onRowSelectionChange={setRowSelection}
			onSearchQueryChange={handleSearchQueryChange}
			onSortingChange={handleSortingChange}
			pageIndex={pageIndex || 0}
			pageSize={pageSize || appConfig.pagination.defaultLimit}
			getRowId={(row) => row.id}
			renderBulkActions={() => (
				<OrganizationBulkActions
					rowSelection={rowSelection}
					onClearSelection={clearSelection}
				/>
			)}
			rowSelection={rowSelection}
			searchPlaceholder="Search organizations..."
			searchQuery={searchQuery || ""}
			sorting={sorting}
			totalCount={data?.total ?? 0}
		/>
	);
}
