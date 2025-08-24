"use client";

import { useEffect, useRef, useState } from "react";
import { mantle } from "viem/chains";
import { useQueryClient } from "@tanstack/react-query";

import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  widget,
} from "../../../..//public/tradingview/charting_library";
import PriceDataFeed from "./PriceDataFeed";
import { Agent } from "@/app/types/agent";

const DEFAULT_CHART_OPTIONS: Omit<
  ChartingLibraryWidgetOptions,
  "container" | "datafeed"
> = {
  library_path: "/tradingview/charting_library/",
  charts_storage_url: "https://saveload.tradingview.com",
  charts_storage_api_version: "1.1",
  client_id: "tradingview.com",
  user_id: "public_user_id",
  interval: "1" as ResolutionString,
  theme: "dark",
  locale: "en",
  fullscreen: false,
  autosize: true,
  // Add this to auto-scroll to latest data
  auto_save_delay: 5,
  // Force chart to show latest data
  time_frames: [
    {
      text: "1H",
      resolution: "1" as ResolutionString,
      description: "1 Hour",
      title: "1H",
    },
    {
      text: "1D",
      resolution: "1" as ResolutionString,
      description: "1 Day",
      title: "1D",
    },
  ],
  custom_formatters: {
    priceFormatterFactory: (symbolInfo, minTick) => {
      return {
        format: (price, signPositive) => {
          if (price === 0) return `0.00`;
          const preciseValue = parseFloat(price.toPrecision(2));
          let formatted;
          if (preciseValue < 1 && preciseValue > 0) {
            const orderOfMagnitude = Math.floor(
              Math.log10(Math.abs(preciseValue))
            );
            const decimals = Math.abs(orderOfMagnitude) + 1;
            formatted = preciseValue.toFixed(decimals);
          } else if (preciseValue >= 1) {
            formatted = preciseValue.toString();
          } else {
            const orderOfMagnitude = Math.floor(
              Math.log10(Math.abs(preciseValue))
            );
            const decimals = Math.abs(orderOfMagnitude) + 1;
            formatted = preciseValue.toFixed(decimals);
          }
          return `${formatted}`;
        },
      };
    },
  },
  loading_screen: {
    backgroundColor: "transparent",
    foregroundColor: "#c25cd6",
  },
  custom_font_family: "Inter, sans-serif",
  enabled_features: [
    "side_toolbar_in_fullscreen_mode",
    "header_in_fullscreen_mode",
  ],
  disabled_features: [
    "go_to_date", // Prevent jumping to arbitrary dates
    "timeframes_toolbar", // Remove problematic time frame buttons
    "volume_force_overlay",
    "create_volume_indicator_by_default",
  ],
  favorites: {
    chartTypes: ["Candles"],
  },
  overrides: {
    // you can add overrides here
  },
};

export const TradingViewWidget = ({
  token,
  isMobile = false,
  onPriceUpdate,
}: {
  token: Agent;
  className?: string;
  isMobile?: boolean;
  onPriceUpdate?: (price: number) => void;
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartingLibraryWidget | null>(null);
  const [loaded, setLoaded] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loaded || !chartContainerRef.current || !token) return;

    // symbol must be the agent coin type that backend expects
    const symbol = token.agent_symbol ?? "Asd";
    const agentFaId = token.fa_id ?? "";

    const datafeed = new PriceDataFeed(
      token,
      queryClient,
      onPriceUpdate
    ) as any;

    const options: ChartingLibraryWidgetOptions = {
      ...DEFAULT_CHART_OPTIONS,
      symbol,
      datafeed,
      container: chartContainerRef.current,
      overrides: {
        ...(DEFAULT_CHART_OPTIONS.overrides || {}),
        priceScaleSelectionStrategyName: "right",
        // Force initial positioning to latest data
        "mainSeriesProperties.style": 1, // Candles
        "paneProperties.background": "#131722",
        "paneProperties.backgroundType": "solid",
      },
      disabled_features: isMobile
        ? [
            ...(DEFAULT_CHART_OPTIONS.disabled_features ?? []),
            "header_widget",
            "header_fullscreen_button",
          ]
        : DEFAULT_CHART_OPTIONS.disabled_features ?? [],
    };

    chart.current = new widget(options);

    // Wait for chart to be ready, then scroll to latest data
    chart.current.onChartReady(() => {
      console.log("📊 Chart is ready, scrolling to latest data...");
      try {
		if(isMobile) {
			chart.current?.applyOverrides({
				"scalesProperties.fontSize": 5,
			});
		}
        const chartWidget = chart.current?.chart();
		
        if (chartWidget) {
          // Set visible range to show latest data with more context
          const now = Math.floor(Date.now() / 1000);
          const fourHoursAgo = now - 4 * 60 * 60; // Show last 4 hours

          setTimeout(() => {
            chartWidget.setVisibleRange({
              from: fourHoursAgo,
              to: now + 10 * 60, // Add 10 minutes buffer to the right
            });
            console.log(
              "📊 Set visible range from",
              new Date(fourHoursAgo * 1000),
              "to",
              new Date((now + 600) * 1000)
            );

            // Also try to reset zoom
            setTimeout(() => {
              chartWidget.resetData();
            }, 500);
          }, 2000); // Wait 2 seconds for data to load
        }
      } catch (e) {
        console.warn("Could not auto-scroll to latest data:", e);
      }
    });

    return () => {
      chart.current?.remove();
      chart.current = null;
    };
  }, [loaded, token, queryClient, isMobile]);

  useEffect(() => {
    if (loaded) return;
    const scriptTag = document.createElement("script");
    scriptTag.src = "/tradingview/datafeeds/udf/dist/bundle.js"; // your built UDF datafeed bundle
    scriptTag.onload = () => setLoaded(true);
    scriptTag.onerror = (e) => {
      console.error("Failed to load UDF bundle:", e);
      // fallback could be triggered here, e.g., render LightweightCharts component instead
    };
    document.head.appendChild(scriptTag);
    return () => {
      // optional cleanup if needed
    };
  }, [loaded]);

  return (
    <div style={{ height: "100%", borderRadius: "13px", overflow: "hidden" }}>
      <div
        id="tv_chart"
        ref={chartContainerRef}
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: 1,
        }}
        className="chartContainer"
      />
    </div>
  );
};
export default TradingViewWidget;
