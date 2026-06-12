"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/admin/ui/page-header";
import {
  DateRangeBar,
  getPresetRange,
  type DateRange,
} from "@/components/admin/analytics/date-range-bar";
import { KPIRow } from "@/components/admin/analytics/kpi-row";
import { RevenueChart } from "@/components/admin/analytics/revenue-chart";
import { OrderVolumeChart } from "@/components/admin/analytics/order-volume-chart";
import { CategoryBreakdown } from "@/components/admin/analytics/category-breakdown";
import { PaymentSplit } from "@/components/admin/analytics/payment-split";
import { OrderFunnel } from "@/components/admin/analytics/order-funnel";
import { TopProductsTable } from "@/components/admin/analytics/top-products-table";
import { InventoryPanel } from "@/components/admin/analytics/inventory-panel";
import { CustomerSummary } from "@/components/admin/analytics/customer-summary";
import { TopCustomersTable } from "@/components/admin/analytics/top-customers-table";
import { LiveOrderFeed } from "@/components/admin/analytics/live-order-feed";
import { AIInsightsPanel } from "@/components/admin/analytics/ai-insights-panel";

function defaultRange(): DateRange {
  const { from, to } = getPresetRange("7d");
  return { from, to, preset: "7d" };
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange);

  return (
    <AdminShell>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">

        <PageHeader
          title="Analytics"
          subtitle="Habiba Minhas · Performance overview"
        />

        {/* Global date filter */}
        <DateRangeBar value={dateRange} onChange={setDateRange} />

        {/* KPI Row */}
        <KPIRow dateRange={dateRange} />

        {/* Revenue chart + Category breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RevenueChart dateRange={dateRange} />
          </div>
          <div className="lg:col-span-4">
            <CategoryBreakdown dateRange={dateRange} />
          </div>
        </div>

        {/* Order volume + Payment split */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <OrderVolumeChart dateRange={dateRange} />
          </div>
          <div className="lg:col-span-5">
            <PaymentSplit dateRange={dateRange} />
          </div>
        </div>

        {/* Order funnel */}
        <OrderFunnel dateRange={dateRange} />

        {/* Top products */}
        <TopProductsTable dateRange={dateRange} />

        {/* Inventory + Customer summary */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InventoryPanel />
          <CustomerSummary dateRange={dateRange} />
        </div>

        {/* Top customers */}
        <TopCustomersTable dateRange={dateRange} />

        {/* Recent orders (live feed) */}
        <LiveOrderFeed />

        {/* AI Insights */}
        <AIInsightsPanel />

      </div>
    </AdminShell>
  );
}
