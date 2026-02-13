import { NextRequest, NextResponse } from "next/server";
import {
    sendWelcomeEmail,
    sendContributionEmail,
    sendPayoutEmail,
    sendJoinGroupEmail,
    sendSupportEmail,
    sendRuleAcceptedEmail,
} from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, ...data } = body;

        if (!type) {
            return NextResponse.json({ error: "Missing email type" }, { status: 400 });
        }

        let result;

        switch (type) {
            case "welcome":
                if (!data.to || !data.name) {
                    return NextResponse.json({ error: "Missing 'to' or 'name'" }, { status: 400 });
                }
                result = await sendWelcomeEmail(data.to, data.name);
                break;

            case "contribution":
                if (!data.to || !data.name || !data.groupName || !data.amount || !data.round) {
                    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
                }
                result = await sendContributionEmail(data.to, data.name, data.groupName, data.amount, data.round);
                break;

            case "payout":
                if (!data.to || !data.name || !data.groupName || !data.amount || !data.round) {
                    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
                }
                result = await sendPayoutEmail(data.to, data.name, data.groupName, data.amount, data.round);
                break;

            case "join_group":
                if (!data.to || !data.name || !data.groupName) {
                    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
                }
                result = await sendJoinGroupEmail(
                    data.to, data.name, data.groupName,
                    data.memberCount || 0, data.contribution || 0, data.frequency || "monthly"
                );
                break;

            case "rule_accepted":
                if (!data.to || !data.recipientName || !data.signerName || !data.groupName || !data.ruleTitle) {
                    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
                }
                result = await sendRuleAcceptedEmail(
                    data.to, data.recipientName, data.signerName,
                    data.groupName, data.ruleTitle,
                    data.acceptedCount || 0, data.totalMembers || 0
                );
                break;

            case "support":
                if (!data.userEmail || !data.userName || !data.subject || !data.message) {
                    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
                }
                result = await sendSupportEmail(data.userEmail, data.userName, data.subject, data.message);
                break;

            default:
                return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error("Email API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to send email" },
            { status: 500 }
        );
    }
}
