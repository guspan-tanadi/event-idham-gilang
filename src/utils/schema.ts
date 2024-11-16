import { z as validate } from "zod";

export const eventSchema = validate.object({
  event_title: validate.string().min(1, "Event title is required"),
  description: validate.string().min(1, "Description is required"),
  category: validate.enum(["MUSIC", "SPORTS", "EDUCATION", "TECHNOLOGY"]),

  date: validate.string().min(1, "Date is required"),
  time: validate.string().min(1, "Time is required"),
  location: validate.string().min(1, "Location is required"),
  seat_quantity: validate
    .union([validate.string(), validate.number()])
    .transform((val) => parseFloat(val.toString()))
    .refine((val) => val > 0, {
      message: "Seat quantity must be greater than 0",
    }),
});

export const discountSchema = validate.object({
  event_id: validate
  .union([validate.string(), validate.number()])
  .transform((val) => parseFloat(val.toString()))
  .refine((val) => val > -1, {
    message: "You have to pick an event",
  }),
  discount_percentage: validate
    .union([validate.string(), validate.number()])
    .transform((val) => parseFloat(val.toString()))
    .refine((val) => val > 0, {
      message: "Discount percentage must be greater than 0",
    }),
  start_date: validate.string().min(1, "Start date is required"),
  end_date: validate.string().min(1, "End date is required"),
});
