"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Users, ArrowLeft, CheckCircle, XCircle, UserPlus, Calendar, Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getGroupPublicInfo, joinGroup, notifyGroupMembers } from "@/lib/database";
import { formatCurrency } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function JoinGroupPage() {
    const params = useParams();
    const router = useRouter();
    const { user, profile, loading: authLoading } = useAuth();
    const [group, setGroup] = useState<{
        id: string; name: string; description: string;
        contribution_amount: number; frequency: string;
        max_members: number; member_count: number; status: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadGroup() {
            if (!params.id) return;
            try {
                const { group: groupData, error: err } = await getGroupPublicInfo(params.id as string);
                if (err || !groupData) {
                    setError("This Stokvel doesn't exist or the link is invalid.");
                } else {
                    setGroup(groupData);
                }
            } catch {
                setError("Failed to load group information.");
            } finally {
                setLoading(false);
            }
        }
        if (!authLoading) loadGroup();
    }, [params.id, authLoading]);

    const handleJoin = async () => {
        if (!user || !group) return;
        setJoining(true);
        setError("");
        try {
            const { error: joinError } = await joinGroup(group.id, user.id);
            if (joinError) {
                if (joinError.message?.includes("already a member")) {
                    router.push(`/groups/${group.id}`);
                    return;
                }
                setError(joinError.message || "Failed to join group");
            } else {
                setJoined(true);
                // Notify existing members
                await notifyGroupMembers(
                    group.id,
                    "New Member Joined!",
                    `${profile?.name || "Someone"} has joined ${group.name}`,
                    "system",
                    user.id
                );
                setTimeout(() => router.push(`/groups/${group.id}`), 2000);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setJoining(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="max-w-lg mx-auto pt-20">
                <LoadingSpinner message="Loading invite..." />
            </div>
        );
    }

    // Not logged in — redirect to register with a return URL
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-kasi-charcoal to-kasi-slate flex flex-col items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
                    <div className="w-14 h-14 bg-kasi-green/10 rounded-2xl flex items-center justify-center mx-auto">
                        <UserPlus className="w-7 h-7 text-kasi-green" />
                    </div>
                    <h1 className="text-lg font-bold text-kasi-charcoal">You&apos;ve Been Invited!</h1>
                    {group && (
                        <p className="text-sm text-gray-500">
                            to join <span className="font-semibold text-kasi-charcoal">{group.name}</span>
                        </p>
                    )}
                    <p className="text-xs text-gray-400">Sign in or create an account to join this Stokvel.</p>
                    <div className="flex flex-col gap-2">
                        <Link
                            href={`/register?redirect=/groups/${params.id}/join`}
                            className="btn-primary text-sm w-full text-center"
                        >
                            Create Account
                        </Link>
                        <Link
                            href={`/login?redirect=/groups/${params.id}/join`}
                            className="btn-outline text-sm w-full text-center"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !group) {
        return (
            <div className="max-w-lg mx-auto pt-20 text-center px-4">
                <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <h2 className="font-semibold text-kasi-charcoal mb-1">Invalid Invite Link</h2>
                <p className="text-gray-400 text-sm mb-4">{error}</p>
                <Link href="/dashboard" className="btn-primary text-sm inline-block">Go to Dashboard</Link>
            </div>
        );
    }

    if (joined) {
        return (
            <div className="max-w-lg mx-auto pt-20 text-center px-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-kasi-charcoal mb-2">Welcome to {group?.name}!</h2>
                <p className="text-sm text-gray-500">You&apos;re now a member. Redirecting to your group...</p>
            </div>
        );
    }

    if (!group) return null;

    const isFull = group.member_count >= group.max_members;

    return (
        <div className="min-h-screen bg-gradient-to-b from-kasi-charcoal to-kasi-slate">
            <div className="max-w-lg mx-auto px-4 pt-10 pb-6">
                <Link href="/dashboard" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mb-6 inline-flex">
                    <ArrowLeft className="w-4 h-4 text-white" />
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-kasi-green/20 rounded-xl flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-kasi-green" />
                    </div>
                    <div>
                        <p className="text-white/60 text-xs">You&apos;ve been invited to join</p>
                        <h1 className="text-white text-xl font-bold">{group.name}</h1>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-t-3xl min-h-[60vh] px-6 pt-8 pb-6">
                {/* Group info card */}
                <div className="border border-gray-100 rounded-2xl p-5 mb-6">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{group.description}</p>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <Coins className="w-4 h-4 text-kasi-green mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Contribution</p>
                            <p className="text-sm font-bold text-kasi-charcoal">{formatCurrency(group.contribution_amount)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <Calendar className="w-4 h-4 text-kasi-gold mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Frequency</p>
                            <p className="text-sm font-bold text-kasi-charcoal capitalize">{group.frequency}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Members</p>
                            <p className="text-sm font-bold text-kasi-charcoal">{group.member_count}/{group.max_members}</p>
                        </div>
                    </div>
                </div>

                {/* Payout preview */}
                <div className="bg-kasi-green/5 border border-kasi-green/10 rounded-2xl p-4 mb-6">
                    <p className="text-xs text-gray-500 mb-1">Expected payout per round</p>
                    <p className="text-2xl font-bold text-kasi-green">
                        {formatCurrency(group.contribution_amount * group.max_members)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {group.max_members} members × {formatCurrency(group.contribution_amount)} {group.frequency}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Join button */}
                {isFull ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                        <p className="text-sm text-amber-700 font-medium">This group is full ({group.max_members}/{group.max_members} members)</p>
                        <p className="text-xs text-amber-600 mt-1">Contact the chairperson to be added when a spot opens up.</p>
                    </div>
                ) : (
                    <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {joining ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Joining...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" /> Join {group.name}
                            </>
                        )}
                    </button>
                )}

                <p className="text-[10px] text-gray-400 text-center mt-4">
                    By joining, you agree to contribute {formatCurrency(group.contribution_amount)} {group.frequency} and follow the group&apos;s constitution rules.
                </p>
            </div>
        </div>
    );
}
