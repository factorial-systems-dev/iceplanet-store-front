import {Component, OnInit, ViewChild} from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';

import {
    ApexAxisChartSeries,
    ApexChart,
    ApexForecastDataPoints,
    ApexXAxis,
    ChartComponent,
    NgApexchartsModule
} from "ng-apexcharts";
import {OrderService} from "../../../shared/service/order.service";
import {NgIf} from "@angular/common";

export type ChartOptions = {
    series: ApexAxisChartSeries,
    chart: ApexChart;
    xaxis: ApexXAxis;
    forecastDataPoints: ApexForecastDataPoints;
}

const Months: string[] = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun",
    "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec"
];

@Component({
    selector: 'app-total-sales',
    standalone: true,
    imports: [MatCardModule, MatMenuModule, MatButtonModule, RouterLink, NgApexchartsModule, NgIf],
    templateUrl: './total-sales.component.html',
    styleUrl: './total-sales.component.scss'
})
export class TotalSalesComponent implements OnInit {
    @ViewChild("chart") chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;

    constructor(private orderService: OrderService) {}

    ngOnInit(): void {
        this.orderService.getOrderMonthly('2024').subscribe(os => {

            this.chartOptions = {
                series: [
                    {
                        name: "Orders",
                        data: os
                    }
                ],
                chart: {
                    height: 282,
                    type: "line",
                    animations: {
                        speed: 500
                    },
                    toolbar: {
                        show: false
                    }
                },
                xaxis: {
                    categories: Months
                },
                forecastDataPoints: {
                    count: 2,
                    dashArray: 4
                },
            }
        });
    }
}
