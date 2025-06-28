import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Select,
  message,
  Space,
  Input,
  Tag,
  Tooltip,
  DatePicker,
  Badge,
  Tabs,
  Card,
  Typography,
  Descriptions,
  Divider,
  List,
  Avatar,
  notification,
  Row,
  Col,
  Spin,
  Empty,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  BellOutlined,
  ShoppingOutlined,
  CloseCircleOutlined,
  CarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useSelector } from "react-redux";

const { Title } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Order status configurations
const orderStatuses = [
  { value: "Pending", label: "PENDING", color: "orange" },
  { value: "Processing", label: "PROCESSING", color: "blue" },
  { value: "Shipped", label: "SHIPPED", color: "purple" },
  { value: "Delivered", label: "DELIVERED", color: "green" },
  { value: "Cancelled", label: "CANCELLED", color: "red" },
];

// Helper function to get status color
const getStatusColor = (status) => {
  const statusObj = orderStatuses.find((s) => s.value === status);
  return statusObj ? statusObj.color : "default";
};

const OrderManagement = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: [],
  });
  const [activeTab, setActiveTab] = useState("all");
  const [notificationCount, setNotificationCount] = useState(0);
  const [trackingInfo, setTrackingInfo] = useState("");
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Get auth token from Redux store
  const { accessToken, user } = useSelector((state) => state.auth);

  // Determine user role
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller" || isAdmin;
  const isCustomer = !isSeller;

  // API request configuration with auth token
  const apiConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  // Fetch orders based on user role
  useEffect(() => {
    fetchOrders();
    const notificationInterval = setInterval(checkNewOrders, 60000); // Check every minute
    return () => clearInterval(notificationInterval);
  }, [user?.role]);

  const checkNewOrders = async () => {
    try {
      let endpoint = getEndpointByRole();

      if (!endpoint) return;

      // Add a timestamp to prevent caching issues
      const timestamp = Date.now();
      const response = await axios.get(
        `${endpoint}?timestamp=${timestamp}`,
        apiConfig
      );

      const data = response.data;

      // If no data received, exit early
      if (!data || !Array.isArray(data)) {
        console.log("No valid order data received");
        return;
      }

      // Check for new orders
      const currentOrderIds = new Set(orders.map((order) => order._id));
      const newOrders = data.filter((order) => !currentOrderIds.has(order._id));

      if (newOrders.length > 0) {
        setNotificationCount((prevCount) => prevCount + newOrders.length);
        notification.info({
          message: "New Orders",
          description: `You have ${newOrders.length} new order(s).`,
          icon: <ShoppingOutlined style={{ color: "#108ee9" }} />,
        });

        // Update orders state with all current orders
        setOrders(data);
      }
    } catch (error) {
      // Only log error, don't show to user during background check
      console.error("Failed to check for new orders:", error);
    }
  };

  const getEndpointByRole = () => {
    if (isAdmin) {
      return "/api/orders/admin/all";
    } else if (isSeller) {
      return "/api/orders/seller";
    } else {
      return "/api/orders/user";
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const endpoint = getEndpointByRole();

      if (!endpoint) {
        message.error("User role not defined");
        return;
      }

      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await axios.get(
        `${endpoint}?timestamp=${timestamp}`,
        apiConfig
      );

      setLastFetchTime(timestamp);

      const data = response.data;
      // Handle different API response formats
      const ordersData = Array.isArray(data) ? data : data.orders || [];

      setOrders(ordersData);
      setNotificationCount(0); // Reset notification count
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error(
        "Failed to fetch orders: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      let endpoint = "";

      if (isAdmin) {
        endpoint = `/api/orders/admin/${orderId}`;
      } else if (isSeller) {
        endpoint = `/api/orders/seller/${orderId}`;
      } else {
        endpoint = `/api/orders/user/${orderId}`;
      }

      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await axios.get(
        `${endpoint}?timestamp=${timestamp}`,
        apiConfig
      );

      const data = response.data;

      // Handle different API response structures
      const orderData = data.order || data;
      const detailsData = data.orderDetails || orderData.items || [];

      setSelectedOrder(orderData);
      setOrderDetails(detailsData);
      setTrackingInfo(orderData.trackingInfo || "");
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      message.error(
        "Failed to fetch order details: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(
        `/api/orders/status/${orderId}`,
        {
          status: newStatus,
          trackingInfo: trackingInfo.trim() || undefined,
        },
        apiConfig
      );

      // Update order in state
      const updatedOrders = orders.map((order) =>
        order._id === orderId
          ? {
              ...order,
              status: newStatus,
              trackingInfo: trackingInfo.trim() || order.trackingInfo,
            }
          : order
      );

      setOrders(updatedOrders);
      message.success("Order status updated successfully");

      // If we're viewing the modal for this order, update the selected order too
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
          trackingInfo: trackingInfo.trim() || selectedOrder.trackingInfo,
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      message.error(
        "Failed to update order status: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      await axios.put(`/api/orders/cancel/${orderId}`, {}, apiConfig);

      // Update order in state
      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, status: "Cancelled" } : order
      );

      setOrders(updatedOrders);
      message.success("Order cancelled successfully");

      // If we're viewing the modal for this order, update the selected order too
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "Cancelled" });
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      message.error(
        "Failed to cancel order: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search text, filters, and active tab
  const getFilteredOrders = () => {
    return orders.filter((order) => {
      const matchesSearch =
        (order._id &&
          order._id.toLowerCase().includes(searchText.toLowerCase())) ||
        (order.user?.name &&
          order.user.name.toLowerCase().includes(searchText.toLowerCase())) ||
        (order.shippingDetails?.address &&
          order.shippingDetails.address
            .toLowerCase()
            .includes(searchText.toLowerCase()));

      const matchesStatus =
        filters.status === "all" || order.status === filters.status;

      const matchesDateRange =
        !filters.dateRange?.length ||
        !filters.dateRange[0] ||
        (moment(order.createdAt).isAfter(filters.dateRange[0]) &&
          moment(order.createdAt).isBefore(filters.dateRange[1]));

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "pending" && order.status === "Pending") ||
        (activeTab === "processing" && order.status === "Processing") ||
        (activeTab === "shipped" && order.status === "Shipped") ||
        (activeTab === "delivered" && order.status === "Delivered") ||
        (activeTab === "cancelled" && order.status === "Cancelled");

      return matchesSearch && matchesStatus && matchesDateRange && matchesTab;
    });
  };

  // Columns for the orders table
  const getColumns = () => {
    const baseColumns = [
      {
        title: "Order ID",
        dataIndex: "_id",
        key: "orderId",
        width: 120,
        ellipsis: true,
      },
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "date",
        width: 120,
        render: (date) => moment(date).format("YYYY-MM-DD"),
        sorter: (a, b) =>
          moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 150,
        render: (status, record) => {
          if (isAdmin || isSeller) {
            return (
              <Select
                value={status}
                style={{ width: 120 }}
                onChange={(value) => handleStatusUpdate(record._id, value)}
                loading={loading && selectedOrder?._id === record._id}
                disabled={
                  record.status === "Cancelled" || record.status === "Delivered"
                }
              >
                {orderStatuses.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    <Tag color={s.color}>{s.label}</Tag>
                  </Select.Option>
                ))}
              </Select>
            );
          } else {
            return (
              <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
            );
          }
        },
        filters: orderStatuses.map((status) => ({
          text: status.label,
          value: status.value,
        })),
        onFilter: (value, record) => record.status === value,
      },
      {
        title: "Total Amount",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 120,
        render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
        sorter: (a, b) => a.totalAmount - b.totalAmount,
      },
      {
        title: "Payment Method",
        dataIndex: "paymentMethod",
        key: "paymentMethod",
        width: 120,
      },
      {
        title: "Actions",
        key: "actions",
        width: 160,
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                icon={<EyeOutlined />}
                onClick={() => fetchOrderDetails(record._id)}
              />
            </Tooltip>

            {isCustomer && record.status === "Pending" && (
              <Tooltip title="Cancel Order">
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleCancelOrder(record._id)}
                  loading={loading && selectedOrder?._id === record._id}
                />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ];

    // Add customer information column for admin and seller views
    if (isAdmin || isSeller) {
      baseColumns.splice(1, 0, {
        title: "Customer",
        key: "customer",
        width: 150,
        render: (_, record) => (
          <div>
            <div>{record.user?.name || "Customer"}</div>
            <small>
              {record.shippingDetails?.address &&
                `${record.shippingDetails.city}, ${record.shippingDetails.country}`}
            </small>
          </div>
        ),
      });
    }

    return baseColumns;
  };

  const OrderDetailsModal = () => {
    if (!selectedOrder) return null;

    return (
      <Modal
        title={
          <Space>
            <ShoppingOutlined />
            <span>Order Details</span>
            <Tag color={getStatusColor(selectedOrder.status)}>
              {selectedOrder.status.toUpperCase()}
            </Tag>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          isCustomer && selectedOrder.status === "Pending" && (
            <Button
              key="cancel"
              danger
              onClick={() => {
                handleCancelOrder(selectedOrder._id);
                setModalVisible(false);
              }}
              loading={loading}
            >
              Cancel Order
            </Button>
          ),
          (isAdmin || isSeller) &&
            selectedOrder.status !== "Delivered" &&
            selectedOrder.status !== "Cancelled" && (
              <Button
                key="updateStatus"
                type="primary"
                onClick={() => {
                  const currentIndex = orderStatuses.findIndex(
                    (s) => s.value === selectedOrder.status
                  );
                  if (currentIndex < orderStatuses.length - 2) {
                    // -2 to avoid 'Cancelled'
                    handleStatusUpdate(
                      selectedOrder._id,
                      orderStatuses[currentIndex + 1].value
                    );
                  }
                }}
                loading={loading}
              >
                Move to Next Status
              </Button>
            ),
        ]}
        width={800}
      >
        <Spin spinning={loading}>
          <Tabs defaultActiveKey="details">
            <TabPane tab="Order Details" key="details">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="Order Information" size="small">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Order ID">
                        {selectedOrder._id}
                      </Descriptions.Item>
                      <Descriptions.Item label="Date">
                        {moment(
                          selectedOrder.createdAt || selectedOrder.orderDate
                        ).format("YYYY-MM-DD HH:mm")}
                      </Descriptions.Item>
                      <Descriptions.Item label="Payment Method">
                        {selectedOrder.paymentMethod}
                      </Descriptions.Item>
                      <Descriptions.Item label="Payment Status">
                        {selectedOrder.paymentStatus || "Completed"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Amount">
                        ${parseFloat(selectedOrder.totalAmount).toFixed(2)}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="Shipping Information" size="small">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Address">
                        {selectedOrder.shippingDetails?.address || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="City">
                        {selectedOrder.shippingDetails?.city || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="State/Province">
                        {selectedOrder.shippingDetails?.state || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Country">
                        {selectedOrder.shippingDetails?.country || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Postal Code">
                        {selectedOrder.shippingDetails?.postalCode || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone">
                        {selectedOrder.shippingDetails?.phone || "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              <Divider />

              <Card title="Order Items" size="small">
                {orderDetails && orderDetails.length > 0 ? (
                  <Table
                    dataSource={orderDetails}
                    rowKey={(record) => record._id || record.productId}
                    pagination={false}
                    columns={[
                      {
                        title: "Product",
                        dataIndex: "product",
                        key: "product",
                        render: (product, record) => (
                          <Space>
                            {product?.images && product.images[0] ? (
                              <Avatar
                                src={product.images[0]}
                                shape="square"
                                size={48}
                              />
                            ) : (
                              <Avatar
                                icon={<ShoppingOutlined />}
                                shape="square"
                                size={48}
                              />
                            )}
                            <span>
                              {product?.productName ||
                                record.productName ||
                                "Product"}
                            </span>
                          </Space>
                        ),
                      },
                      {
                        title: "Quantity",
                        dataIndex: "quantity",
                        key: "quantity",
                        width: 100,
                      },
                      {
                        title: "Price",
                        dataIndex: "price",
                        key: "price",
                        width: 120,
                        render: (price) => `$${parseFloat(price).toFixed(2)}`,
                      },
                      {
                        title: "Subtotal",
                        key: "subtotal",
                        width: 120,
                        render: (_, record) =>
                          `$${(record.price * record.quantity).toFixed(2)}`,
                      },
                    ]}
                  />
                ) : (
                  <Empty description="No items found" />
                )}

                <div style={{ marginTop: 16, textAlign: "right" }}>
                  <Title level={4}>
                    Total: ${parseFloat(selectedOrder.totalAmount).toFixed(2)}
                  </Title>
                </div>
              </Card>

              {(isAdmin || isSeller) &&
                selectedOrder.status !== "Delivered" &&
                selectedOrder.status !== "Cancelled" && (
                  <>
                    <Divider />
                    <Card title="Update Order" size="small">
                      <Row gutter={16}>
                        <Col span={16}>
                          <Input
                            placeholder="Enter tracking information (optional)"
                            value={trackingInfo}
                            onChange={(e) => setTrackingInfo(e.target.value)}
                            prefix={<CarOutlined />}
                          />
                        </Col>
                        <Col span={8}>
                          <Select
                            style={{ width: "100%" }}
                            value={selectedOrder.status}
                            onChange={(value) =>
                              handleStatusUpdate(selectedOrder._id, value)
                            }
                          >
                            {orderStatuses.map((s) => (
                              <Select.Option key={s.value} value={s.value}>
                                {s.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </Col>
                      </Row>
                    </Card>
                  </>
                )}
            </TabPane>

            <TabPane tab="Notifications" key="notifications">
              <List
                dataSource={selectedOrder.notifications || []}
                renderItem={(notification) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<BellOutlined />} />}
                      title={notification.message}
                      description={moment(notification.date).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )}
                    />
                  </List.Item>
                )}
                locale={{ emptyText: "No notifications" }}
              />
            </TabPane>

            {selectedOrder.trackingInfo && (
              <TabPane tab="Tracking" key="tracking">
                <Card>
                  <Descriptions title="Tracking Information" bordered>
                    <Descriptions.Item label="Tracking Number" span={3}>
                      {selectedOrder.trackingInfo}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </TabPane>
            )}
          </Tabs>
        </Spin>
      </Modal>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={2}>
            <Space>
              {isAdmin && "Admin"}
              {isSeller && !isAdmin && "Seller"}
              {isCustomer && "My"} Orders
              {notificationCount > 0 && <Badge count={notificationCount} />}
            </Space>
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchOrders}
            loading={loading}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="All Orders" key="all" />
        <TabPane
          tab={
            <Badge
              count={orders.filter((o) => o.status === "Pending").length}
              offset={[10, 0]}
            >
              Pending
            </Badge>
          }
          key="pending"
        />
        <TabPane
          tab={
            <Badge
              count={orders.filter((o) => o.status === "Processing").length}
              offset={[10, 0]}
            >
              Processing
            </Badge>
          }
          key="processing"
        />
        <TabPane
          tab={
            <Badge
              count={orders.filter((o) => o.status === "Shipped").length}
              offset={[10, 0]}
            >
              Shipped
            </Badge>
          }
          key="shipped"
        />
        <TabPane tab="Delivered" key="delivered" />
        <TabPane tab="Cancelled" key="cancelled" />
      </Tabs>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space size="large" wrap>
            <Input
              placeholder="Search by Order ID or Shipping Address"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />

            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Select.Option value="all">All Statuses</Select.Option>
              {orderStatuses.map((status) => (
                <Select.Option key={status.value} value={status.value}>
                  <Tag color={status.color}>{status.label}</Tag>
                </Select.Option>
              ))}
            </Select>

            <RangePicker
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />

            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText("");
                setFilters({ status: "all", dateRange: [] });
              }}
            >
              Clear Filters
            </Button>
          </Space>
        </div>

        <Table
          columns={getColumns()}
          dataSource={getFilteredOrders()}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 800 }}
          pagination={{
            total: getFilteredOrders().length,
            pageSize: 10,
            showTotal: (total) => `Total ${total} orders`,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
          locale={{ emptyText: "No orders found" }}
        />
      </Card>

      <OrderDetailsModal />
    </div>
  );
};

export default OrderManagement;
