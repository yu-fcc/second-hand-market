import { useParams } from "react-router-dom"
import { TinyColor } from '@ctrl/tinycolor';
import React, { useState, useEffect } from 'react';
import { HeartFilled, WarningOutlined ,HeartOutlined} from '@ant-design/icons';
import { web3, sellerListContract, sellerABI, buyGoodContract, buyerListContract, buyerABI, reportsContract } from "../contract/contractUtils_yjw";
import { Descriptions, Carousel, Button, ConfigProvider, Space, Divider, Flex, Tag, Form, Modal, InputNumber, Rate, Input, Select } from 'antd';
import "../css/layout.css";

const contentStyle = {
    height: '270px',
}
const colors1 = ['#6253E1', '#04BEFE'];
const getHoverColors = (colors) =>
    colors.map((color) => new TinyColor(color).lighten(5).toString());
const getActiveColors = (colors) =>
    colors.map((color) => new TinyColor(color).darken(5).toString());
//收藏图标
const StyledHeart = (props) => (
    <span style={{ fontSize: '30px' }}>
        <HeartFilled {...props} />
    </span>
);
const customIcon = {
    1: <StyledHeart />,
};


export default function GoodsInfoWrapper() {
    // 获取路由参数
    const prarms = useParams()
    // 使用Form组件
    const [form] = Form.useForm();
    // 定义商品信息状态
    const [data, setData] = useState([]);
    // 定义商品图片状态
    const [image, setImage] = useState([]);
   
    // 获取用户角色ID
    var roleId = window.localStorage.getItem("roleId");
   
   
    // 组件挂载时执行
    useEffect(() => {
        console.log("----------effect-----------")
        info();
        return () => { //退出组件执行
            console.log("----------return-----------")
        };
    }, []); // 空数组[]表示仅在组件挂载时执行
    //购买商品弹窗操作
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState([]);
    const showModal = () => {
        setOpen(true);
    };
    const handleOk = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setOpen(false);
        }, 3000);
    };
    const handleCancel = () => {
        setOpen(false);
    };
    const handleQuantityChange = (value) => {
        setQuantity(value);
    };
    //收藏商品弹窗操作
    const [opentwo, setOpentwo] = useState(false);
    const [loadingtwo, setLoadingtwo] = useState(false);
    const showModaltwo = () => {
        setOpentwo(true);
    }
    const handleOktwo = () => {
        setLoadingtwo(true);
        setTimeout(() => {
            setLoadingtwo(false);
            setOpentwo(false);
        }, 3000);
    }
    const handleCanceltwo = () => {
        setOpentwo(false);
    }

    //购买商品弹窗调用信息
    const nameItemChildren = data[0] ? data[0].children : null;
    const priceItemChildren = data[1] ? data[1].children : null;
    const quantityItemChildren = data[2] ? data[2].children : null;
    //商品详情合约调用    
    const info = async () => {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        var account = accounts[0];
        const data = [];
        const image = [];
        // var sellerContractAddress = await sellerListContract.methods.getSellerList().call({ from: account });
        // var sellerId = window.localStorage.getItem("sellerId");
        // console.log("sellerId", sellerId)
       
        var buyerAddress = window.localStorage.getItem("buyerAddress");
        
        console.log("buyerAddress", buyerAddress)
        var sellerAddress = prarms.owner;
        window.localStorage.setItem("sellerAddress", sellerAddress);
        console.log("sellerContractAddress", sellerAddress)
        //实例化指定合约地址的合约
        var sellerContract = new web3.eth.Contract(sellerABI, sellerAddress);
        var userName = await sellerContract.methods.userName().call({ from: account })
        var productIds = await sellerContract.methods.getProductIds().call({ from: account })
        //调用方法获取指定索引的商品信息
        var productInfo = await sellerContract.methods.getProductInfoById(productIds[prarms.id - 1]).call({ from: account })
        window.localStorage.setItem("goodId", productInfo[0]);
        let price = productInfo[3].toString();
        let quantity = productInfo[4].toString();
        let status = productInfo[5].toString();
        var photo = productInfo[6];
        var timestamp = Number(productInfo[8]);
        let date = new Date(timestamp * 1000);
        // 获取年月日时分秒  
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以要加1，并使用padStart填充0  
        let day = date.getDate().toString().padStart(2, '0');
        let hours = date.getHours().toString().padStart(2, '0');
        let minutes = date.getMinutes().toString().padStart(2, '0');
        let seconds = date.getSeconds().toString().padStart(2, '0');
        // 拼接日期和时间字符串  
        let formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        image.push(photo);
        setImage(image);
        data.push({
            key: '1',
            label: '商品名称',
            children: productInfo[1],
        })
        data.push({
            key: '2',
            label: '商品价格',
            children: price,
        })
        data.push({
            key: '3',
            label: '商品数量',
            children: quantity,
        })
        data.push({
            key: '4',
            label: '商品描述',
            children: productInfo[2],
        })
        data.push({
            key: '5',
            label: '在售状态',
            children: status,
        })
        data.push({
            key: '6',
            label: '商品类别',
            children: productInfo[7],
        })
        data.push({
            key: '7',
            label: '上架时间',
            children: formattedDateTime,
        })
        setData(data);
    }
    //购买商品合约调用
    const buyGoods = async () => {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        var account = accounts[0];
        var buyerId = window.localStorage.getItem("buyerId");
        var buyerAddress = window.localStorage.getItem("buyerAddress");
        console.log("buyerId", buyerId)
        console.log("buyerAddress", buyerAddress)
        var sellerAddress = window.localStorage.getItem("sellerAddress");
        console.log("sellerAddress", sellerAddress)
        var goodId = window.localStorage.getItem("goodId");
        await buyGoodContract.methods.addBuyGood(buyerAddress, buyerId, sellerAddress, goodId, quantity, priceItemChildren).send({ from: account, gas: "30000000" })
            .on('receipt', function (receipt) {
                if (receipt.status == 1) {
                    alert("购买成功");
                    handleCancel();
                    reduceQuantity();
                } else {
                    alert("购买失败");
                }
            });
    }
    //减少相应的销售商品数量
    const reduceQuantity = async () => {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        var account = accounts[0];
        var sellerAddress = window.localStorage.getItem("sellerAddress");
        var goodId = window.localStorage.getItem("goodId");
        var sellerContract = new web3.eth.Contract(sellerABI, sellerAddress);
        var status = await sellerContract.methods.updateQuantity(goodId, quantity).send({ from: account, gas: "300000" })
        window.localStorage.setItem("status", status);
    }
    //收藏商品
    // const [idData, setIdData] = useState([]);
    // const [sellerAdres, setSellerAdres] = useState([]);
    const collection = async () => {
        const idData = prarms.id;
        const sellerAddress = window.localStorage.getItem("sellerAddress");
        window.localStorage.setItem("idData", idData);
        window.localStorage.setItem("sellerAdres", sellerAddress);
  
    }
    const { Option } = Select;
    //举报商品
    const onFinish = async (values) => {
        console.log('Received values of form: ', values);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        var account = accounts[0];
        var buyerAddress = window.localStorage.getItem("buyerAddress");
        var sellerAddress = window.localStorage.getItem("sellerAddress");
        var goodId = window.localStorage.getItem("goodId");
        await reportsContract.methods.addReport(buyerAddress, sellerAddress, goodId, values.reportBy, values.description)
            .send({ from: account, gas: "300000" })
            .on('receipt', function (receipt) {
                if (receipt.status == 1) {
                    alert("举报成功");
                    handleCanceltwo();
                } else {
                    alert("举报失败");
                }
            });
    }
   
  
    return (
        <div className="product-container">
          
            <Form
                form={form}
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
            >
                <Modal
                    open={opentwo}
                    title="举报"
                    onOk={handleOktwo}
                    onCancel={handleCanceltwo}
                    footer={[
                        <Button key="back" onClick={handleCanceltwo}>
                            取消
                        </Button>,
                        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                            确认
                        </Button>,
                    ]}
                >
                    <Form.Item
                        name="reportBy"
                        label="举报类别"
                        style={{ boxSizing: 'border-box', width: '40%' }}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select defaultValue="违禁产品"  >
                            <Option value="违禁产品">违禁产品</Option>
                            <Option value="滥发信息">滥发信息</Option>
                            <Option value="欺诈骗钱">欺诈骗钱</Option>
                            <Option>...</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="举报理由"
                        rules={[
                            {
                                required: true,
                                message: '请输入你的举报理由!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Modal>
            </Form>
             
            <div className="product-image-container">
                <h3 style={contentStyle}><img alt="example" src={"https://gateway.pinata.cloud/ipfs/" + image[0]} /></h3>
            </div>
           
            <div className="product-details-container">

                <div className="product-favorite" onClick={collection}>
                    <Flex gap="middle" vertical >
                        <Rate defaultValue={0} character={({ index = -1 }) => customIcon[index + 1]} ></Rate>
                    </Flex>
                </div>
                <h3 className="product-favorite-text">收藏</h3>

                <Divider type="vertical" style={{ height: '100%' }} />
                <Divider orientation="left">商品详细</Divider>
                <Descriptions layout="vertical" items={data} />
                <Button className="product-report" style={{ backgroundColor: 'chocolate' }} onClick={() => { showModaltwo() }}><WarningOutlined /></Button>
                <h4 className="product-report-text">举报</h4>
                <Space>
                    <ConfigProvider
                        theme={{
                            components: {
                                Button: {
                                    colorPrimary: `linear-gradient(135deg, ${colors1.join(', ')})`,
                                    colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors1).join(', ')})`,
                                    colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors1).join(', ')})`,
                                    lineWidth: 0,
                                },
                            },
                        }}
                    >

                        <Button type="primary" size="large" className="product-button"
                            onClick={
                                () => {
                                    showModal()
                                }
                            }
                        >
                            立即购买
                        </Button>

                    </ConfigProvider>
                </Space>
                
            </div>
            <Modal
                open={open}
                title="购买商品"
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        取消
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={buyGoods}>
                        确认
                    </Button>,
                ]}
            >
                <p>{"商品名称:" + nameItemChildren}</p>
                <p>{"商品价格:" + priceItemChildren}</p>
                <p>{"商品数量:"} <InputNumber
                    min={1}
                    value={quantity}
                    onChange={handleQuantityChange}
                />  {"库存:" + quantityItemChildren}</p>
            </Modal>
        </div>
    )
}
