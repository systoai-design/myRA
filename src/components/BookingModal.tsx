import { useState } from "react";
import { Calendar, Clock, User, Mail, Phone, X } from "lucide-react";
import { toast } from "sonner";

const GHL_API_KEY = import.meta.env.VITE_GHL_API_KEY || "";
const GHL_CALENDAR_ID = import.meta.env.VITE_GHL_CALENDAR_ID || "";
const GHL_LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID || "";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBooked, setIsBooked] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || !email.trim() || !date || !time) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            // Build the appointment start/end times
            const startTime = new Date(`${date}T${time}:00`);
            const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 min appointment

            const appointmentData = {
                calendarId: GHL_CALENDAR_ID,
                locationId: GHL_LOCATION_ID,
                contactId: undefined as string | undefined,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                title: `MyRA Consultation - ${name}`,
                appointmentStatus: "confirmed",
                assignedUserId: undefined as string | undefined,
                address: "",
                ignoreDateRange: false,
                toNotify: true,
            };

            // First, create or find the contact
            const contactRes = await fetch(
                "https://services.leadconnectorhq.com/contacts/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${GHL_API_KEY}`,
                        Version: "2021-07-28",
                    },
                    body: JSON.stringify({
                        firstName: name.split(" ")[0],
                        lastName: name.split(" ").slice(1).join(" ") || "",
                        email,
                        phone,
                        locationId: GHL_LOCATION_ID,
                        source: "MyRA Chat",
                    }),
                }
            );

            if (contactRes.ok) {
                const contactData = await contactRes.json();
                appointmentData.contactId = contactData.contact?.id;
            }

            // Create the appointment
            const res = await fetch(
                "https://services.leadconnectorhq.com/calendars/events/appointments",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${GHL_API_KEY}`,
                        Version: "2021-04-15",
                    },
                    body: JSON.stringify(appointmentData),
                }
            );

            if (res.ok) {
                setIsBooked(true);
                toast.success("Meeting scheduled successfully!");
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("GHL booking error:", errorData);
                toast.error("Unable to schedule meeting. Please try again.");
            }
        } catch (error) {
            console.error("Booking error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isBooked) {
            setIsBooked(false);
            setName("");
            setEmail("");
            setPhone("");
            setDate("");
            setTime("");
        }
        onClose();
    };

    if (!isOpen) return null;

    // Generate min date (today)
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-[#13152a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {isBooked ? (
                    /* Success State */
                    <div className="px-8 py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                            <Calendar className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Meeting Confirmed!</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            A licensed retirement professional will meet with you on{" "}
                            <span className="text-white font-medium">{new Date(`${date}T${time}`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>{" "}
                            at <span className="text-white font-medium">{time}</span>.
                        </p>
                        <p className="text-gray-500 text-xs mb-8">A confirmation email will be sent to {email}.</p>
                        <button
                            onClick={handleClose}
                            className="w-full py-3 bg-[#2d68ff] hover:bg-[#255ce6] text-white rounded-xl font-medium transition-colors active:scale-[0.97]"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    /* Booking Form */
                    <>
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Schedule a Meeting</h2>
                                    <p className="text-xs text-gray-400">Meet with a licensed retirement professional</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="px-8 pb-8 space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Full Name *
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Smith"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2d68ff] focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> Email *
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2d68ff] focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" /> Phone (optional)
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2d68ff] focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        min={today}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2d68ff] focus:border-transparent transition-all [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> Time *
                                    </label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2d68ff] focus:border-transparent transition-all [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-3.5 bg-[#2d68ff] hover:bg-[#255ce6] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all active:scale-[0.97] shadow-lg shadow-blue-600/20 mt-2"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Scheduling...
                                    </span>
                                ) : (
                                    "Confirm Meeting"
                                )}
                            </button>

                            <p className="text-[11px] text-gray-500 text-center">
                                30 minute consultation · No obligation · 100% free
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
