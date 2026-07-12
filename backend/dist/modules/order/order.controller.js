import { successResponse } from '../../shared/responses/apiResponse.js';
import { queryOrdersSchema } from './order.validation.js';
export class OrderController {
    orderService;
    constructor(orderService) {
        this.orderService = orderService;
    }
    checkout = async (req, res) => {
        const userId = req.user.id;
        const order = await this.orderService.checkout(userId, req.body);
        res.status(201).json(successResponse('Order created successfully', order));
    };
    getMyOrders = async (req, res) => {
        const userId = req.user.id;
        const orders = await this.orderService.getMyOrders(userId);
        res.status(200).json(successResponse('My orders fetched successfully', orders));
    };
    getOrderById = async (req, res) => {
        const order = await this.orderService.getOrderById(req.params.id);
        res.status(200).json(successResponse('Order fetched successfully', order));
    };
    getAllOrders = async (req, res) => {
        const parsedQuery = queryOrdersSchema.parse(req.query);
        const orders = await this.orderService.getAllOrders(parsedQuery);
        res.status(200).json(successResponse('All orders fetched successfully', orders));
    };
    updateStatus = async (req, res) => {
        const order = await this.orderService.updateOrderStatus(req.params.id, req.body);
        res.status(200).json(successResponse('Order status updated', order));
    };
    verifyQr = async (req, res) => {
        const order = await this.orderService.verifyAndCollectOrder(req.body.token);
        res.status(200).json(successResponse('Order collected successfully', order));
    };
    decodeQr = async (req, res) => {
        const order = await this.orderService.decodeQr(req.body.token);
        res.status(200).json(successResponse('Order decoded successfully', order));
    };
}
