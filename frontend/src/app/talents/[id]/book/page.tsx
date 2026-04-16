"use client";

import { redirect } from "next/navigation";

export default function BookingRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/booking/${params.id}`);
}
