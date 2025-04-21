import { Link, Outlet, useNavigate } from "react-router-dom";
import React, { useState, useEffect }   from 'react';
import { MailOutlined, AppstoreOutlined, } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, Carousel,Button } from 'antd';
import "../css/layout.css"

const { Header, Content, Footer, Sider } = Layout;

const items1 = ['/'].map((key) => ({
    key,
    label: '校园二手交易系统',
}));

function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label,
    };
}


const items2 = [
    getItem('购物中心', 'sub1', <MailOutlined />, [
        getItem('商品信息列表', '/api/1/goodListWapper'),
        getItem('商品分类查询', '/api/1/goodSelect'),
    ]),
    getItem('个人中心', 'sub2', <AppstoreOutlined />, [
        getItem('个人信息', '/api/1/personCeter' ),
        getItem('商品收藏', '/api/1/goodsCollection'),
        getItem('卖家评价列表', '/api/1/commontList'),
    ]),
];
const Index = () => {

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    


    return (
        <Layout 
        >
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <div className="demo-logo"
                    style={{ height: '40px', width: '40px' }}
                />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['2']}
                    items={items1}
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                    onClick={(e) => {
                        navigate(e.key, { replace: true })
                    }}
                />
            </Header>
            <Content
                style={{
                    padding: '0 48px',
                }}
            >
                <Breadcrumb
                    style={{
                        margin: '16px 0',
                    }}
                >

                    <Breadcrumb.Item>
                        <Link to="/">首页</Link>
                    </Breadcrumb.Item>
                </Breadcrumb>
                <Layout
                    style={{
                        padding:'24px 0',
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Sider
                        style={{
                            background: colorBgContainer,
                        }}
                        width={200}
                    >
                        <Menu
                            mode="inline"

                            style={{
                                height: '100%',
                            }}
                            items={items2}
                            onClick={(e) => {
                                navigate(e.key, { replace: true })
                            }}
                        >
                        </Menu>
                    </Sider>
                    <Content
                        style={{
                            padding: '0 24px',
                            minHeight: 280,
                        }}
                    >
                        <h1 style={{ textAlign: 'center' }}>欢迎使用二手交易系统</h1>
                        <Outlet></Outlet>
                    </Content>
                </Layout>
            </Content >
            <Footer
                style={{
                    textAlign: 'center',
                }}
            >
                Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </Footer>
        </Layout >

    )
};
export default Index;