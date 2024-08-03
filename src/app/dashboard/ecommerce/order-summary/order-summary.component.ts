import {Component, OnInit, ViewChild} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import {
    ChartComponent,
    ApexNonAxisChartSeries,
    ApexResponsive,
    ApexChart,
    ApexLegend,
    NgApexchartsModule,
    ApexDataLabels,
    ApexTooltip
} from "ng-apexcharts";
import {OrderService} from "../../../shared/service/order.service";
import {NgIf} from "@angular/common";

export type ChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
    responsive: ApexResponsive[];
    labels: any;
    tooltip: ApexTooltip;
    colors: string[];
};

@Component({
    selector: 'app-order-summary',
    standalone: true,
    imports: [MatCardModule, MatMenuModule, MatButtonModule, RouterLink, NgApexchartsModule, NgIf],
    templateUrl: './order-summary.component.html',
    styleUrl: './order-summary.component.scss'
})
export class OrderSummaryComponent implements OnInit{
    @ViewChild("chart") chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;

    constructor(private orderService: OrderService) {}

    ngOnInit(): void {
        this.orderService.getOrderStatuses().subscribe(o => {
            const labels = o.map(s => s._id);
            const series = o.map(s => s.count);
            const sum = series.reduce((a, b) => a + b, 0);
            const seriesPercent = series.map(s => (s / sum) * 100);

            this.chartOptions = {
                series: seriesPercent,
                chart: {
                    height: 467,
                    type: "donut"
                },
                labels: labels,
                legend: {
                    offsetY: 0,
                    fontSize: "14px",
                    position: "bottom",
                    horizontalAlign: "center",
                    labels: {
                        colors: "#919aa3",
                    },
                    itemMargin: {
                        horizontal: 12,
                        vertical: 12
                    }
                },
                dataLabels: {
                    enabled: false,
                    style: {
                        fontSize: '14px'
                    },
                    dropShadow: {
                        enabled: false
                    }
                },
                colors: [
                    "#00cae3", "#0e7aee", "#796df6"
                ],
                tooltip: {
                    y: {
                        formatter: function(val) {
                            return val + "%";
                        }
                    }
                }
            };
        });
    }
}
