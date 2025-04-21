import React, { useState, useEffect } from 'react';
import { Card, List, Modal, Button, Pagination, Image, Divider } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { web3, sellerABI, sellerListContract } from "../contract/contractUtils_yjw";


const { Meta } = Card;

const IndexListWapper = () => {
  //  const location = useLocation();
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  //const { data } = location.state || [];
  useEffect(() => {
    console.log("----------effect-----------")
    list2();
    return () => { //退出组件执行
      console.log("----------return-----------")
    };
  }, []); // 空数组[]表示仅在组件挂载时执行

  const list2 = async () => {
    const data = [];
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    var account = accounts[0];
    var sellerContractAddress = await sellerListContract.methods.getSellerList().call({ from: account });
    var roleId = window.localStorage.getItem("roleId");
    if (roleId === '1') {
      for (var i = 0; i < sellerContractAddress.length; i++) {
        var sellerContract = new web3.eth.Contract(sellerABI, sellerContractAddress[i]);
        var userName = await sellerContract.methods.userName().call({ from: account })
        var sellerId = await sellerContract.methods.newSellerId().call({ from: account })
        var productIds = await sellerContract.methods.getProductIds().call({ from: account })
        for (var j = 0; j < productIds.length; j++) {
          var productInfo = await sellerContract.methods.getProductInfoById(productIds[j]).call({ from: account })
          var sellerAddress = sellerContractAddress[i];
          console.log(sellerAddress);
          var onsale = window.localStorage.getItem("status");
          console.log(onsale)
          if (productInfo[5] == true) {
            data.push({
              title: userName,
              sellerId: sellerId,
              owner: sellerAddress,
              productId: productIds[j],
              productInfo: productInfo[1],
              price: productInfo[3],
              quantity: productInfo[4],
              status: productInfo[5],
              imageHash: productInfo[6],
            })
            setData(data);
          }
        }
      }
    } else {
      var sellerId = window.localStorage.getItem("sellerId");
      var sellerContract = new web3.eth.Contract(sellerABI, sellerContractAddress[sellerId - 1]);
      var userName = await sellerContract.methods.userName().call({ from: account })
      var productIds = await sellerContract.methods.getProductIds().call({ from: account })
      for (var j = 0; j < productIds.length; j++) {
        var productInfo = await sellerContract.methods.getProductInfoById(productIds[j]).call({ from: account })
        var sellerAddress = sellerContractAddress[sellerId - 1];
        console.log(sellerAddress);
        data.push({
          title: userName,
          owner: sellerAddress,
          productId: productIds[j],
          productInfo: productInfo[1],
          price: productInfo[3],
          quantity: productInfo[4],
          status: productInfo[5],
          imageHash: productInfo[6],
        })
        setData(data);
      }
    }

  }

  return (
    <div>
      <Divider orientation="left" style={{ fontSize: '30px' }}>商品列表</Divider>
      <List
        grid={{
          gutter: 16,
          //column: 4,
        }}
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 6,
        }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              style={{
                width: 300,
              }}
              onClick={
                () => {
                  console.log(item)
                  navigate(`/api/1/goodInfoWrapper/${item.productId}/${item.owner}`)
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
                {"商品状态：" + item.status}
              </div>} />
            </Card>
            <div>
              <Button type="primary" size="medium" className='searchProduct-button'
                onClick={
                  () => {
                    navigate(`/api/1/retrospect/${item.owner}/${item.productId}`)
                  }
                }
              >
                信息追溯
              </Button>
            </div>
          </List.Item>

        )}
      />
    </div>
  )
};

export default IndexListWapper;