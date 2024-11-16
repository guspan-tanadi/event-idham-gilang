export interface Events {
  event_id: number;
  event_title: string;
  description: string;
  category: "MUSIC" | "SPORTS" | "EDUCATION" | "TECHNOLOGY";
  price: number;
  discounted_price: number;
  is_free: boolean;
  date: Date;
  time: Date;
  location: string;
  seat_quantity: number;
  image_url: string;
}

export interface Users {
  user_id: number;
  username: string;
  fullname: string;
  email?: string;
  role: "USER" | "ADMIN";
  created_at: Date;
}

export interface Registrations {
  registration_id: number;
  quantity: number;
  registration_date: Date;
  registration_status: "REGISTERED" | "ATTENDED";
  User: {
    email: string;
  };
  Event: {
    event_title: string;
  };
}

export interface UserRegistrations {
  registration_id: number;
  quantity: number;
  registration_date: Date;
  registration_status: "REGISTERED" | "ATTENDED";
  Payments: {
    amount: number;
    payment_status: "PENDING" | "COMPLETED" | "FAILED";
    payment_method: "CREDIT_CARD" | "QRIS" | "BANK_TRANSFER";
  }[];
  Event: {
    event_title: string;
    date: Date;
    location: string;
  };
}

export interface Payments {
  payment_id: number;
  registration_id: number;
  amount: number;
  payment_status: "PENDING" | "COMPLETED" | "FAILED";
  payment_method: "CREDIT_CARD" | "QRIS" | "BANK_TRANSFER";
  payment_date: Date;
  Registration: {
    User: {
      email: string;
    };
    Event: {
      event_title: string;
    };
  };
}

export interface Reviews {
  review_id: number;
  rating: number;
  comment: string;
  User: {
    username: string;
  }
}

export interface Discounts {
  discount_id: number;
  event_id: number;
  discount_percentage: number;
  start_date: Date;
  end_date: Date;
}

export interface TokenPayload {
  id: number;
  role: string;
};
