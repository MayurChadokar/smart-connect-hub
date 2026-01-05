export interface Registration {
  id: string;
  full_name: string;
  mobile_number: string;
  email: string;
  gender: "male" | "female" | "other";
  department: string;
  address: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
}
