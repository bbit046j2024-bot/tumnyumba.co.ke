import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import PayButton from "@/components/payments/PayButton";
import { Building2, ShieldCheck, User, Receipt, Home } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

function fmt(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

export default async function PublicBookingPayPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/pay/${id}`);
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      partner: {
        select: {
          id: true,
          userId: true,
          companyName: true,
          status: true,
          paymentRouting: true,
        },
      },
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  // Authorization: Student who owns the booking, Admin, or Partner who created it
  const isStudent = booking.studentId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const isPartnerOwner = booking.partner.userId === session.user.id;

  if (!isStudent && !isAdmin && !isPartnerOwner) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 font-poppins">Access Restricted</h2>
        <p className="text-xs text-gray-500">
          This booking is assigned to another student account ({booking.student.email}). Please log in with the correct account.
        </p>
        <Link href="/" className="btn-primary text-xs py-2 px-4 inline-block">
          Return Home
        </Link>
      </div>
    );
  }

  const amountDue = Number(booking.amountDue);
  const amountPaid = Number(booking.amountPaid);
  const remaining = Math.max(0, amountDue - amountPaid);

  return (
    <div className="min-h-[80vh] py-10 px-4 bg-gray-50/50">
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-[#E4F5EC] text-[#1F6B4A] text-xs font-semibold px-3 py-1 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure M-Pesa Checkout
          </div>
          <h1 className="text-2xl font-bold font-poppins text-gray-900">Confirm &amp; Pay Booking</h1>
          <p className="text-xs text-gray-500">
            Booking reference: <span className="font-mono font-medium text-gray-700">{booking.id}</span>
          </p>
        </div>

        {/* Booking Card */}
        <div className="card p-6 space-y-4 border border-gray-100 bg-white">
          <div className="flex items-start justify-between pb-4 border-b border-gray-100">
            <div>
              <div className="text-xs text-gray-400 font-medium">Property Partner</div>
              <div className="font-bold text-gray-900 text-base font-poppins mt-0.5">
                {booking.partner.companyName}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5" />
            </div>
          </div>

          {booking.description && (
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="font-semibold text-gray-800 mb-0.5">Booking Details:</div>
              {booking.description}
            </div>
          )}

          {/* Student Info */}
          <div className="flex items-center justify-between text-xs text-gray-600 py-1">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" /> Billed To:
            </span>
            <span className="font-semibold text-gray-900">
              {booking.student.name} ({booking.student.phone || "No phone"})
            </span>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Total Agreed Price:</span>
              <span className="font-semibold text-gray-800">{fmt(amountDue)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
              <span>Amount Paid to Date:</span>
              <span>{fmt(amountPaid)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100 font-poppins">
              <span>Balance Remaining:</span>
              <span className="text-primary-700 text-base">{fmt(remaining)}</span>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <PayButton
          bookingId={booking.id}
          amountDue={amountDue}
          amountPaid={amountPaid}
        />

        {/* Payment History */}
        {booking.payments.length > 0 && (
          <div className="card p-5 space-y-3 border border-gray-100 bg-white">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wide">
              <Receipt className="w-4 h-4 text-primary-700" /> Payment History
            </div>
            <div className="divide-y divide-gray-100">
              {booking.payments.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-semibold text-gray-900">
                      {p.mpesaReceiptNumber || p.id.slice(0, 12)}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{fmt(Number(p.amount))}</div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        p.status === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
