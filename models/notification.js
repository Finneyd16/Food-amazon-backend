const Joi = require("joi");
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      recipientType: {
        type: String,
        enum: ["Customer", "Admin"],
        required: true,
      },
    },

    type: {
      type: String,
      enum: ["Order", "Promotion", "System", "Review", "Stock Alert"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      maxLength: 100,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      maxLength: 500,
      trim: true,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    relatedType: {
      type: String,
      enum: ["Order", "Product", "Customer", "Review"],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

function validateNotification(notification) {
  const schema = Joi.object({
    recipientId: Joi.string().required(),
    recipientType: Joi.string().valid("Customer", "Admin").required(),
    type: Joi.string()
      .valid("Order", "Promotion", "System", "Review", "Stock Alert")
      .required(),
    title: Joi.string().max(100).required(),
    message: Joi.string().max(500).required(),
    relatedId: Joi.string().allow(null),
    relatedType: Joi.string()
      .valid("Order", "Product", "Customer", "Review")
      .allow(null),
    priority: Joi.string().valid("low", "medium", "high"),
  });
  return schema.validate(notification);
}

module.exports.Notification = Notification;
module.exports.validate = validateNotification;
