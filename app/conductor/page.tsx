"use client"

import { getBuses, savedBuses } from "@/lib/busStorage"
import { useEffect, useState } from "react"
import { Plus, Trash2, Bus, MapPin, IndianRupee, Users, LayoutDashboard } from "lucide-react"

export default function ConductorPage() {
    const [name, setName] = useState("")
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const [price, setPrice] = useState("")
    const [seats, setSeats] = useState("")
    const [buslist, setBuslist] = useState<any[]>([])

    const refreshList = () => {
        const data = getBuses()
        setBuslist(data)
    }

    const handleAddBus = () => {
        if (!name || !from || !to || !price || !seats) {
            alert("Please fill all fields")
            return
        }

        const existing = getBuses()
        const newBus = {
            id: Date.now(),
            name,
            from,
            to,
            type: "AC Seated",
            departure: "08:00 AM",
            arrival: "04:00 PM",
            duration: "8h",
            seats: Number(seats),
            price: Number(price),
            rating: 4.5,
            amenities: ["WiFi", "Water"]
        }

        const updated = [...existing, newBus]
        savedBuses(updated)
        refreshList() // Update the UI immediately

        alert("Bus added successfully! 👍")
        setName(""); setFrom(""); setTo(""); setPrice(""); setSeats("");
    }

    useEffect(() => {
        refreshList()
    }, [])

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to remove this bus?")) {
            const currentBuses = getBuses()
            const updated = currentBuses.filter((bus: any) => bus.id !== id)
            savedBuses(updated)
            setBuslist(updated)
        }
    }

    return (
        <div className="min-h-screen bg-secondary/20 font-sans pb-20">
            {/* --- TOP NAV --- */}
            <header className="bg-primary p-6 shadow-lg mb-8">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 text-primary-foreground">
                        <LayoutDashboard size={28} />
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Conductor Dashboard</h1>
                    </div>
                    <div className="bg-white/10 px-4 py-1 rounded-full text-xs font-bold text-primary-foreground uppercase tracking-widest">
                        Admin Access
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT: ADD BUS FORM --- */}
                <div className="lg:col-span-4">
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-xl sticky top-8">
                        <h2 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                            <Plus className="text-primary" size={20} /> Register New Bus
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">Bus Name</label>
                                <input
                                    className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-primary outline-none transition-all"
                                    placeholder="e.g. Royal Cruiser" value={name} onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">From</label>
                                    <input
                                        className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                        placeholder="Origin" value={from} onChange={(e) => setFrom(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">To</label>
                                    <input
                                        className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                        placeholder="Destination" value={to} onChange={(e) => setTo(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">Price (₹)</label>
                                    <input
                                        type="number" className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                        placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">Total Seats</label>
                                    <input
                                        type="number" className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                        placeholder="40" value={seats} onChange={(e) => setSeats(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAddBus}
                                className="w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl mt-4 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 uppercase tracking-tighter"
                            >
                                Add to Fleet
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: ACTIVE FLEET LIST --- */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black uppercase tracking-tighter">Active Fleet ({buslist.length})</h2>
                        <div className="h-[1px] flex-1 bg-border mx-6 hidden md:block"></div>
                    </div>

                    {buslist.length === 0 ? (
                        <div className="bg-card border-2 border-dashed border-border p-20 rounded-3xl text-center">
                            <Bus size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground font-bold italic">No buses registered in the system.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {buslist.map((bus) => (
                                <div key={bus.id} className="bg-card border border-border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <Bus size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-foreground uppercase tracking-tight leading-none mb-1">{bus.name}</h3>
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                                                    <MapPin size={10} /> {bus.from} → {bus.to}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                                                    <Users size={10} /> {bus.seats} Seats
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right px-6 border-x border-border hidden md:block">
                                            <p className="text-lg font-black text-foreground leading-none">₹{bus.price}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Base Fare</p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(bus.id)}
                                            className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    )
}