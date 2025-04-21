import React, { useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Select, Radio, Modal, Card, Image, List, Divider, Flex, Tag } from 'antd';
import "../css/layout.css";
import { web3, sellerListContract, sellerABI } from "../contract/contractUtils_yjw";

const { Option } = Select;
const { Meta } = Card;

const GoodSelect = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [classesData, setClassesData] = useState([]);

  useEffect(() => {
    console.log("----------effect-----------")
    DynamicTags();
    return () => { //退出组件执行
      console.log("----------return-----------")
    };
  }, []);

  //定义标签颜色
  const colors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'purple', 'geekblue'];

  //定义标签值
  const DynamicTags = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    var account = accounts[0];
    const classesData = [];
    var sellerContractAddress = await sellerListContract.methods.getSellerList().call({ from: account });
    for (var i = 0; i < sellerContractAddress.length; i++) {
      var sellerContract = new web3.eth.Contract(sellerABI, sellerContractAddress[i]);
      var productIds = await sellerContract.methods.getProductIds().call({ from: account })
      for (var j = 0; j < productIds.length; j++) {
        var productInfo = await sellerContract.methods.getProductInfoById(productIds[j]).call({ from: account })
        if (productInfo[5] == true) {
          classesData.push(productInfo[7])
        }
      }
      setClassesData(classesData);
    }
    console.log(classesData)
  }
  // 使用map函数遍历颜色数组，为每个颜色渲染一个Tag组件  
  const tags = classesData.map((data, index) => (
    <Tag key={index} color={colors[index % colors.length]}>{data}</Tag>
  ));

  //商品查询方法
  const onFinish = async (values) => {
    console.log('Received values of form: ', values);
    console.log(values.selectByWord)
    const data = [];
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    var account = accounts[0];
    var sellerContractAddress = await sellerListContract.methods.getSellerList().call({ from: account });
    for (var i = 0; i < sellerContractAddress.length; i++) {
      var sellerContract = new web3.eth.Contract(sellerABI, sellerContractAddress[i]);
      var userName = await sellerContract.methods.userName().call({ from: account })
      var sellerId = await sellerContract.methods.newSellerId().call({ from: account })
      var productIds = await sellerContract.methods.getProductIds().call({ from: account })
      for (var j = 0; j < productIds.length; j++) {
        var productInfo = await sellerContract.methods.getProductInfoById(productIds[j]).call({ from: account })
        var sellerAddress = sellerContractAddress[i];

        if (values.selectById == 1) {
          if (productInfo[3] <= values.selectByWord) {
            if (productInfo[5] == true) {
              data.push({
                title: userName,
                sellerId: sellerId,
                sellerAddress: sellerAddress,
                productId: productIds[j],
                productInfo: productInfo[1],
                price: productInfo[3],
                quantity: productInfo[4],
                imageHash: productInfo[6],
              })
            }
          }
        } else {
          if (values.selectByWord == productInfo[7]) {
            if (productInfo[5] == true) {
              data.push({
                title: userName,
                sellerId: sellerId,
                sellerAddress: sellerAddress,
                productId: productIds[j],
                productInfo: productInfo[1],
                price: productInfo[3],
                quantity: productInfo[4],
                imageHash: productInfo[6],
              })
            }
          }
        }
      }
      setData(data);
    }
  };


  const [modal, contextHolder] = Modal.useModal();

  return (
    <div>
      <Divider orientation="left" style={{ fontSize: '30px' }}>查询功能</Divider>
      <Form
        form={form}
        onFinish={onFinish}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        scrollToFirstError
      >
        <Form.Item
          name="selectById"
          style={{ boxSizing: 'border-box', width: '20%' }}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select defaultValue="价格范围"  >
            <Option value="1">价格范围</Option>
            <Option value="2">商品类别</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="selectByWord"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item className='select-form-button'>
          <Button type="primary" htmlType="submit" className="login-form-button">
            <SearchOutlined />
          </Button>
        </Form.Item>
      </Form>
      <Divider orientation="left">查询功能提示</Divider>
      <p>1. 价格范围：输入一个价格，查询价格在这个值内的商品</p>
      <p>2. 商品类别：输入一个以下商品类别，查询商品类别为这个值的商品</p>
      <Flex gap="4px 0" wrap>
        {tags}
      </Flex>

      <Divider orientation="left"></Divider>
      <List
        grid={{
          gutter: 16,
          //column: 4,
        }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              style={{
                width: 250,
              }}
              onClick={
                /*() => showModal(item)*/
                () => {
                  console.log(item)

                  // navigate(`/api/1/goodInfoWrapper/${item.productId}`)
                  // window.localStorage.setItem("sellerId", item.sellerId);
                }


              } // 添加点击事件  
            >
              <Image
                src={"https://gateway.pinata.cloud/ipfs/" + item.imageHash}
                style={{
                  objectFit: 'cover',
                  width: '100%', // 设置为100%以确保图片不超过Card的宽度  
                  height: 250, /* 设置一个固定高度，但请注意这可能会改变宽高比 */

                }}
              />
              <Meta title={"卖家名称：" + item.title} description={<div>
                {"商品名称：" + item.productInfo}
                <br />
                {"商品价格：" + item.price}
                <br />
                {"商品数量：" + item.quantity}
              </div>} />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default GoodSelect;
