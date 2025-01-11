'use client'
import React from 'react'
import Image from 'next/image'
import { IoBagOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineWorkHistory } from "react-icons/md";
import { FaTruckFast } from "react-icons/fa6";
import { FaRegCheckCircle } from "react-icons/fa";
import ReactECharts from 'echarts-for-react';
import { LuPrinter } from "react-icons/lu";
import { IoEyeOutline } from "react-icons/io5";
import { SiThefinals } from "react-icons/si";
import { GiNuclearWaste } from "react-icons/gi";
const Mainbar = () => {
    var series = [
        {
            data: [120, 200, 150, 80, 70, 110, 130],
            type: 'bar',
            stack: 'a',
            name: 'a'
        },
        {
            data: [10, 46, 64, '-', 0, '-', 0],
            type: 'bar',
            stack: 'a',
            name: 'b'
        },
        {
            data: [30, '-', 0, 20, 10, '-', 0],
            type: 'bar',
            stack: 'a',
            name: 'c'
        },
        {
            data: [30, '-', 0, 20, 10, '-', 0],
            type: 'bar',
            stack: 'b',
            name: 'd'
        },
        {
            data: [10, 20, 150, 0, '-', 50, 10],
            type: 'bar',
            stack: 'b',
            name: 'e'
        }
    ];

    const stackInfo: { [key: string]: { stackStart: number[], stackEnd: number[] } } = {};
    for (let i = 0; i < series[0].data.length; ++i) {
        for (let j = 0; j < series.length; ++j) {
            const stackName = series[j].stack;
            if (!stackName) {
                continue;
            }
            if (!stackInfo[stackName]) {
                stackInfo[stackName] = {
                    stackStart: [],
                    stackEnd: []
                };
            }
            const info = stackInfo[stackName];
            const data = series[j].data[i];
            if (data && data !== '-') {
                if (info.stackStart[i] == null) {
                    info.stackStart[i] = j;
                }
                info.stackEnd[i] = j;
            }
        }
    }
    for (let i = 0; i < series.length; ++i) {
        const data = series[i].data as number[] | { value: number, itemStyle: object }[];
        const info = stackInfo[series[i].stack];
        for (let j = 0; j < series[i].data.length; ++j) {
            // const isStart = info.stackStart[j] === i;
            const isEnd = info.stackEnd[j] === i;
            const topBorder = isEnd ? 20 : 0;
            const bottomBorder = 0;
            data[j] = {
                value: data[j] as number,
                itemStyle: {
                    borderRadius: [topBorder, topBorder, bottomBorder, bottomBorder]
                }
            };
        }
    }

    const option2 = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: series as any
    };





    const option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '25%',
            right: '-1%',
            orient: 'vertical',
            itemGap: 20,
            textStyle: {
                fontSize: 12,
            }
        },

        series: [
            {
                name: 'Access From',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 40,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: 1048, name: 'Rice' },
                    { value: 735, name: 'Potatoes' },
                    { value: 580, name: 'Yam' },
                    { value: 484, name: 'Garri' }
                ]
            }
        ]
    };

    const data = [
        { number: '234587', date: 'Nov 12th, 2024', time: '9:45 PM', name: 'Afolabi Bolaji', payment: 'Bank Transfer', amount: '50,000', status: 'pending', action: 'pending', print: <LuPrinter />, eyes: <IoEyeOutline /> },
        { number: '234587', date: 'Nov 12th, 2024', time: '9:45 PM', name: 'Afolabi Bolaji', payment: 'Bank Transfer', amount: '50,000', status: 'pending', action: 'pending', print: <LuPrinter />, eyes: <IoEyeOutline /> },
        { number: '234587', date: 'Nov 12th, 2024', time: '9:45 PM', name: 'Afolabi Bolaji', payment: 'Bank Transfer', amount: '50,000', status: 'pending', action: 'pending', print: <LuPrinter />, eyes: <IoEyeOutline /> },

    ];
    return (
        <div className='bg-white w-[100%] h-auto overflow-hidden flex justify-start items-center flex-col'>
            
            <div className='w-full flex justify-center items-center my-5 mt-14'>
                <Image src='/creators.png' height={40} width={400} alt='mint' />
            </div>
            <div className='flex gap-x-10 items-center'>
                <div style={{
                    background: 'linear-gradient(93.1deg, #4460dd 0%, #1d2e7a 98.22%)'
                }} className='w-[237px] h-[200px] rounded-[25px] flex justify-center items-center'>
                    <div className='flex justify-center items-center flex-col text-white gap-y-2'>
                        {/* <Image src='/profit.png' height={22} width={22} alt='profit image' /> */}
                        <p className='text-[16px]'>Total passes sold</p>
                        <p className='text-[20px] font-medium'>36</p>
                      
                    </div>
                </div>
                <div style={{
                    background: 'linear-gradient(126.48deg, #b546e0 4.03%, #5a1b74 95%)'
                }} className='w-[237px] h-[200px] rounded-[25px] flex justify-center items-center'>
                    <div className='flex justify-center items-center flex-col text-white gap-y-2'>
                        {/* <Image src='/profit.png' height={22} width={22} alt='profit image' /> */}
                        <p className='text-[16px]'>Revenue Generated</p>
                        <p className='text-[20px] font-medium'>NGN 700,000</p>
                    </div>
                </div>
                <div style={{
                    background: 'linear-gradient(125.29deg, #4460dd 3.36%, #1d2e7a 95.95%)'
                }} className='w-[237px] h-[200px] rounded-[25px] flex justify-center items-center'>
                    <div className='flex justify-center items-center flex-col text-white gap-y-2'>
                        {/* <Image src='/profit.png' className='-mt-14' height={22} width={22} alt='profit image' /> */}
                        <p className='text-[16px]'>Top selling NFT</p>
                        <p className='text-[20px] font-medium'>Gold</p>
                    </div>
                </div>
            </div>
            <div className='my-[20px] h-auto w-[100%] p-2 flex gap-x-14 justify-evenly items-center'>
                <div className='w-[237px] h-[80px] gap-x-2 bg-[#f4f4f4] rounded-2xl shadow-md p-3 flex items-center'>
                    <div className='bg-purple-300 h-[40px] w-[40px] rounded-full flex justify-center items-center'>
                        <SiThefinals size={22} className='text-green-800' />
                    </div>
                    <div>
                        <p className='text-[0.8rem] font-thin'>Total NFTs</p>
                        <p className='font-bold'>397</p>
                    </div>
                </div>

                {/* <div className='w-[237px] h-[80px] gap-x-2 bg-[#f4f4f4] rounded-2xl shadow-md p-3 flex items-center'>
                    <div className='bg-blue-300 h-[40px] w-[40px] rounded-full flex justify-center items-center'>
                        <MdOutlineWorkHistory size={22} className='text-[#004ea9]' />
                    </div>
                    <div>
                        <p className='text-[0.8rem] font-thin'>Orders Pending</p>
                        <p className='font-bold'>101</p>
                    </div>
                </div> */}

                <div className='w-[237px] h-[80px] gap-x-2 bg-[#f4f4f4] rounded-2xl shadow-md p-3 flex items-center'>
                    <div className='bg-blue-300 h-[40px] w-[40px] rounded-full flex justify-center items-center'>
                        <FaRegCheckCircle size={22} className='text-gray-800' />
                    </div>
                    <div>
                        <p className='text-[0.8rem] font-thin'>NFTs delivered</p>
                        <p className='font-bold'>49</p>
                    </div>
                </div>

                <div className='w-[237px] h-[80px] gap-x-2 bg-[#f4f4f4] rounded-2xl shadow-md p-3 flex items-center'>
                    <div className='bg-violet-300 h-[40px] w-[40px] rounded-full flex justify-center items-center'>
                     <GiNuclearWaste size={22} className='text-[#e44d26]' />
                    </div>
                    <div>
                        <p className='text-[0.8rem] font-thin'>NFTs discarded</p>
                        <p className='font-bold'>203</p>
                    </div>
                </div>


            </div>
            {/* <div className='flex items-center justify-between w-full px-2'>
                <div className='w-[470px] h-[350px] bg-[#f4f4f4] rounded-2xl shadow-lg p-5 pb-10'>
                    <p className='text-[20px] font-[700]'>Weekly Sales</p>
                    <div className='flex mt-5 justify-around items-center'>
                        <div className='h-[80%] w-[100%]'>
                            <ReactECharts option={option2} />
                        </div>

                    </div>
                </div>
                <div className='w-[470px] h-[350px] bg-[#f4f4f4] rounded-2xl shadow-lg p-5 pb-10'>
                    <p className='text-[20px] font-[700]'>Best Selling Products</p>
                    <div className='flex mt-5 justify-around items-center'>
                        <div className='h-[80%] w-[100%] -ml-20'>
                            <ReactECharts option={option} />
                        </div>

                    </div>
                </div>
            </div> */}

        </div >
    )
}

export default Mainbar
