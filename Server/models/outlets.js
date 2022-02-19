const mongoose = require("mongoose");

const Outlet = mongoose.Schema({

    brand_uuid: [],
    org_uuid: { type: String },
    setup: {
        currency_sign: { type: String },
        decimal_length: { type: String },
        round_off_invoice: { type: String },
        outlet_time_zone: { type: String }
    },
    customer_category_uuid: [{
        category_uuid: { type: String },
        category_title: { type: String },
    }],
    financial_year: [{
        fin_uuid: { type: String },
        fin_name: { type: String },
        created_on: { type: String },
        fin_start_date: { type: String },
        fin_end_date: { type: String },
        seat_uuid: [],
        item_uuid: [],
        menu_uuid: [],
    }],
    invoice_series: [{
        series: { type: String },
        user_uuid: { type: String },
        last_used_at: { $timestamp: { type: String } },
        next_order_number: { type: String },
        kot_start: { type: String },
        kot_end: { type: String },
        next_kot_number: { type: String },
    }],
    outlet_details: {
        outlet_name: { type: String },
        outlet_mobile: { type: String },
        outlet_email: { type: String },
        outlet_logo: { type: String },
        outlet_address: {
            outlet_area_pin: { type: String },
            outlet_typed_address: { type: String },
            outlet_town: { type: String },
            outlet_district: { type: String },
            outlet_state: { type: String },
            outlet_country: { type: String },
        }
    },
    outlet_merchant_id: { type: String },
    outlet_uuid: { type: String },
    section_details: [{
        section_uuid: { type: String },
        section_name: { type: String },
        section_sort_order: { type: String },
    }],
    cash_denominations: [{
        title: { type: String },
        value: { type: String },
        sort_order: { type: String },
    }],
    current_working_day: {
        $date: { type: String }
    },
    customer_link_services: [
        {
            dine_in: { type: String },
            button_status: { type: String },
        },
        {
            delivery: { type: String },
            button_status: { type: String },
        },
        {
            take_away: { type: String },
            button_status: { type: String },
        },
        {
            schedule: { type: String },
            button_status: { type: String },
        },
    ],
    customer_links: [{ type: String }],
    kot_type: { type: String },
    invoice_setup: [{
        brand_uuid: { type: String },
        field_values: {
            brand_invoice_logo: { type: String },
            invoice_heading: { type: String },
            invoice_title: { type: String },
            invoice_address: { type: String },
            invoice_phone: { type: String },
            invoice_blank: { type: String },
            invoice_bottomnote: { type: String },
        },
        printer_name: { type: String },
        invoice_field_customization: {
            seat: { type: String },
            ticket_number: { type: String },
            order_number: { type: String },
            date: { type: String },
            time: { type: String },
            payment_mode: { type: String },
            cashier: { type: String },
            customer_name_dinein: { type: String },
            customer_name_takeaway: { type: String },
            customer_name_delivery: { type: String },
            customer_name_zomato: { type: String },
            customer_mobile_dinein: { type: String },
            customer_mobile_takeaway: { type: String },
            customer_mobile_delivery: { type: String },
            customer_mobile_zomato: { type: String },
            customer_address_dinein: { type: String },
            customer_address_takeaway: { type: String },
            customer_address_delivery: { type: String },
            customer_address_zomato: { type: String },
            serial_number_in_items: { type: String },
            total_item_quantity: { type: String },
            item_display_type: { type: String },
            multi_serving_display: { type: String }
        },
    }],
    kot_setup: {
        kot_field_customization: {
            seat: { type: String },
            ticket_number: { type: String },
            order_number: { type: String },
            date: { type: String },
            time: { type: String },
            placed_by: { type: String },
            category_name_in_items: { type: String },
            customer_name_dinein: { type: String },
            customer_name_takeaway: { type: String },
            customer_name_delivery: { type: String },
            customer_name_zomato: { type: String },
            customer_mobile_dinein: { type: String },
            customer_mobile_takeaway: { type: String },
            customer_mobile_delivery: { type: String },
            customer_mobile_zomato: { type: String },
            customer_address_dinein: { type: String },
            customer_address_takeaway: { type: String },
            customer_address_delivery: { type: String },
            customer_address_zomato: { type: String },
            serial_number_in_items: { type: String },
            total_item_quantity: { type: String },
            item_display_type: { type: String },
            multi_serving_display: { type: String },
            item_amount: { type: String }
        },
        printer_setup: [{
            printer_name: { type: String },
            copies: { type: String },
            kot_heading: { type: String },
            item_group_uuid: { type: String }
        }]
    },
    order_integrations: [{
        brand_uuid: { type: String },
        service_title: { type: String }
    }],
    delivery_setup: {
        ordering_minimum_bill_amount: { type: String },
        ordering_allowance: { type: String },
        delivery_charge_condition: { type: String },
        delivery_charge_bill_amount: { type: String },
        dellivery_charges: { type: String },
        message_service_available: { type: String },
        message_service_unavailable: { type: String },
        message_after_order: { type: String },
        notification_sms_confirmation: { type: String },
        notification_sms_order_ready: { type: String },
        payment_modes: [{ type: String }],
        customer_location: { type: String },
    },
    pickup_setup: {
        message_service_available: { type: String },
        message_service_unavailable: { type: String },
        message_after_order: { type: String },
        notification_sms_confirmation: { type: String },
        notification_sms_order_ready: { type: String },
        payment_modes: [{ type: String }],
        customer_location: { type: String },
        minimum_pickup_time: { type: String }
    },
    meal_scheduling: {
        customer_location: { type: String },
        meals: [{
            meal_uuid: { type: String },
            meal_title: { type: String },
            meal_status: { type: String },
            meal_sort_order: { type: String }
        }]
    }
})


module.exports = mongoose.model("outlet", Outlet);