import React from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Login from '../pages/Login_yjw.js'
import Register from '../pages/Register_yjw.js'
import SellerIndex from '../pages/SellerIndex_yjw.js'
import Addproduct from '../pages/Addproduct_yjw.js'
import GoodListWapper from '../pages/GoodList_yjw.js'
import BuyerIndex from '../pages/BuyerIndex_yjw.js'
import GoodInfoWrapper from '../pages/GoodInfo_yjw.js'
import PersonCeter from '../pages/PersonCeter_yjw.js'
import GoodsCollection from '../pages/GoodsCollection_yjw.js'
import GoodSelect from '../pages/GoodSelect_yjw.js'
import GoodsCommont from '../pages/GoodsCommont_yjw.js'
import CommontList from '../pages/CommontList_yjw.js'
import OrderListWapper from '../pages/OrderList_yjw.js'
import ReportList from '../pages/ReportList_yjw.js'
import Retrospect from '../pages/Retrospect_yjw.js'
export default function MyRoute() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path='/api/1' element={<BuyerIndex />}>
                    <Route path="goodListWapper" element={<GoodListWapper />} />
                    <Route path="goodInfoWrapper/:id/:owner" element={<GoodInfoWrapper />} />
                    <Route path="goodSelect" element={<GoodSelect />} />
                    <Route path="personCeter" element={<PersonCeter />} />
                    <Route path="goodsCommont/:id" element={<GoodsCommont />} />
                    <Route path="goodsCollection" element={<GoodsCollection />} />
                    <Route path="commontList" element={<CommontList />} />
                    <Route path="retrospect/:owner/:goodId" element={<Retrospect />} />
                </Route>

                <Route path='/api/2' element={<SellerIndex />}>
                    <Route path="addProduct" element={<Addproduct />} />
                    <Route path="goodListWapper" element={<GoodListWapper />} />
                    <Route path="commontList" element={<CommontList />} />
                    <Route path="orderListWapper" element={<OrderListWapper />} />
                    <Route path="goodsCommont/:id" element={<GoodsCommont />} />
                    <Route path="reportList" element={<ReportList />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}