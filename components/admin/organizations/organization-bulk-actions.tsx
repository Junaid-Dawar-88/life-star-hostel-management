"use client";

import NiceModal from "@ebay/nice-modal-react";
import type * as React from "react";
import { toast } from "sonner";
import {
	CsvDelimiterModal,
	type DelimiterType,
} from "@/components/csv-delimiter-modal";
import {
	type BulkActionItem,
	DataTableBulkActions,
	getSelectedRowIds,
} from "@/components/ui/custom/data-table";
import { downloadCsv, downloadExcel } from "@/lib/utils";
import { trpc } from "@/trpc/client";

export type OrganizationBulkActionsProps = {
	rowSelection: Record<string, boolean>;
	onClearSelection: () => void;
};

export function OrganizationBulkActions({
	rowSelection,
	onClearSelection: _onClearSelection,
}: OrganizationBulkActionsProps): React.JSX.Element {
	const exportCsv = trpc.admin.organization.exportSelectedToCsv.useMutation();
	const exportExcel =
		trpc.admin.organization.exportSelectedToExcel.useMutation();

	const getDelimiterChar = (delimiterType: DelimiterType): string => {
		switch (delimiterType) {
			case "comma":
				return ",";
			case "semicolon":
				return ";";
			case "tab":
				return "\t";
			default:
				return ",";
		}
	};

	const handleExportSelectedToCsv = async (delimiter: DelimiterType) => {
		const organizationIds = getSelectedRowIds(rowSelection);
		if (organizationIds.length === 0) {
			toast.error("No organizations selected.");
			return;
		}
		try {
			const csv = await exportCsv.mutateAsync({ organizationIds });
			const delimiterChar = getDelimiterChar(delimiter);
			const csvData =
				delimiter === "comma" ? csv : csv.replace(/,/g, delimiterChar);
			downloadCsv(csvData, "organizations.csv");
			toast.success("CSV exported.");
		} catch (_err) {
			toast.error("Failed to export CSV.");
		}
	};

	const handleExportSelectedToExcel = async () => {
		const organizationIds = getSelectedRowIds(rowSelection);
		if (organizationIds.length === 0) {
			toast.error("No organizations selected.");
			return;
		}
		try {
			const base64 = await exportExcel.mutateAsync({ organizationIds });
			downloadExcel(base64, "organizations.xlsx");
			toast.success("Excel exported.");
		} catch (_err) {
			toast.error("Failed to export Excel.");
		}
	};

	const actions: BulkActionItem[] = [
		{
			label: "Export to CSV",
			onClick: () => {
				NiceModal.show(CsvDelimiterModal, {
					onConfirm: handleExportSelectedToCsv,
				});
			},
		},
		{
			label: "Export to Excel",
			onClick: handleExportSelectedToExcel,
		},
	];

	return <DataTableBulkActions actions={actions} rowSelection={rowSelection} />;
}
