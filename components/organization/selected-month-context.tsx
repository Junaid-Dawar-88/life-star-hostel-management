"use client";

import { createContext, useContext, useEffect, useState } from "react";

type SelectedMonthCtx = {
	month: number;
	year: number;
	setMonth: (m: number) => void;
	setYear: (y: number) => void;
};

const SelectedMonthContext = createContext<SelectedMonthCtx | null>(null);

export function SelectedMonthProvider({ children }: React.PropsWithChildren) {
	const now = new Date();
	const [month, setMonth] = useState(now.getMonth() + 1);
	const [year, setYear] = useState(now.getFullYear());

	// Auto-update when the real calendar month rolls over
	useEffect(() => {
		const tick = () => {
			const d = new Date();
			const m = d.getMonth() + 1;
			const y = d.getFullYear();
			setMonth((prev) => (prev !== m ? m : prev));
			setYear((prev) => (prev !== y ? y : prev));
		};
		const id = setInterval(tick, 60_000);
		return () => clearInterval(id);
	}, []);

	return (
		<SelectedMonthContext.Provider value={{ month, year, setMonth, setYear }}>
			{children}
		</SelectedMonthContext.Provider>
	);
}

export function useSelectedMonth(): SelectedMonthCtx {
	const ctx = useContext(SelectedMonthContext);
	if (!ctx)
		throw new Error(
			"useSelectedMonth must be used within SelectedMonthProvider",
		);
	return ctx;
}
