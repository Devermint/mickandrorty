"use client";

import { useEffect, useRef, useState } from "react";
import { mantle } from "viem/chains";
import { useQueryClient } from "@tanstack/react-query";

import {
  ChartingLibraryWidgetOptions,
  ChartPropertiesOverrides,
  IChartingLibraryWidget,
  ResolutionString,
  widget,
} from "../../../..//public/tradingview/charting_library";
import PriceDataFeed from "./PriceDataFeed";
import { Agent } from "@/app/types/agent";

const CHART_THEME_OVERRIDES: Partial<ChartPropertiesOverrides> = {
  "paneProperties.backgroundType": "solid",
  "paneProperties.background": "#101010",
  "paneProperties.backgroundGradientStartColor": "#101010",
  "paneProperties.backgroundGradientEndColor": "#101010",
  "paneProperties.vertGridProperties.color": "#1f1f1f",
  "paneProperties.horzGridProperties.color": "#1f1f1f",
  "paneProperties.leftAxis.backgroundColor": "#101010",
  "paneProperties.rightAxis.backgroundColor": "#101010",
  "paneProperties.leftAxis.drawTicks": true,
  "paneProperties.rightAxis.drawTicks": true,
  "paneProperties.leftAxis.textColor": "#d1d5db",
  "paneProperties.rightAxis.textColor": "#d1d5db",
  "scalesProperties.backgroundColor": "#101010",
  "scalesProperties.lineColor": "#1f1f1f",
  "scalesProperties.textColor": "#d1d5db",
  "paneProperties.separatorColor": "#1f1f1f",
  "paneProperties.separatorBackgroundColor": "#101010",
  "mainSeriesProperties.candleStyle.borderColor": "#d1d5db",
  "mainSeriesProperties.candleStyle.wickColor": "#d1d5db",
  "mainSeriesProperties.candleStyle.drawBorder": true,
  "timeScale.backgroundColor": "#101010",
  "timeScale.borderColor": "#1f1f1f",
  "layout.backgroundColor": "#101010",
  "layout.background": "#101010",
  "paneProperties.topMargin": 0,
  "paneProperties.bottomMargin": 0,
  "paneProperties.leftMargin": 0,
  "paneProperties.rightMargin": 0,

  // Ensure legend background matches
  "paneProperties.legendProperties.showBackground": false,

  // Additional scale properties
  "scalesProperties.showLeftScale": true,
  "scalesProperties.showRightScale": true,

  // Crosshair background
  "paneProperties.crossHairProperties.color": "#1f1f1f",
  "paneProperties.crossHairProperties.transparency": 90,
};

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
    foregroundColor: "#46DD0B",
  },
  custom_font_family: "Inter, sans-serif",
  enabled_features: [],
  disabled_features: [],
  favorites: {
    chartTypes: ["Candles"],
  },
  overrides: {
    ...CHART_THEME_OVERRIDES,
  },
  custom_css_url: "/tradingview/custom-theme.css",
  //   custom_colors: {
  //     platform: "#101010",
  //     pane: "#101010",
  //     chart: "#101010",
  //   },
};

export const TradingViewWidget = ({
  token,
  isMobile = false,
}: {
  token: Agent;
  className?: string;
  isMobile?: boolean;
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartingLibraryWidget | null>(null);
  const [loaded, setLoaded] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loaded || !chartContainerRef.current || !token) return;

    // symbol must be the agent coin type that backend expects
    const symbol = token.agent_symbol ?? "Asd";
    const agentPackage = token.fa_id ?? "";

    const datafeed = new PriceDataFeed(
      symbol,
      agentPackage,
      queryClient
    ) as any;

    const options: ChartingLibraryWidgetOptions = {
      ...DEFAULT_CHART_OPTIONS,
      symbol,
      datafeed,
      container: chartContainerRef.current,
      overrides: {
        ...(DEFAULT_CHART_OPTIONS.overrides || {}),
        priceScaleSelectionStrategyName: "right",
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
    chart.current.onChartReady(() => {
      chart.current?.applyOverrides(CHART_THEME_OVERRIDES);
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
    <div style={{ height: "100%" }}>
      <div
        id="tv_chart"
        ref={chartContainerRef}
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#101010",
          opacity: 1,
        }}
        className="chartContainer"
      />
    </div>
  );
};
export default TradingViewWidget;
