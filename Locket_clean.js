/*
 * Locket Gold Clean Local Script
 * Author: Ritmada
 * Purpose: Safe local override of RevenueCat entitlements for Locket Widget
 * No telemetry, zero external outbound queries, in-memory patch
 */

if (typeof $response === "undefined") {
    // Phase 1: Request interceptor - Strip ETag and caching headers
    var headers = $request.headers || {};
    for (var k of Object.keys(headers)) {
        var lower = k.toLowerCase();
        if (lower === "if-none-match" || lower === "x-revenuecat-etag") {
            delete headers[k];
        }
    }
    $done({ headers: headers });
} else {
    // Phase 2: Response interceptor - Inject Gold entitlements
    var obj = {};
    try {
        if ($response.body) {
            obj = JSON.parse($response.body);
        }
    } catch (err) {
        obj = {};
    }

    var now = new Date().toISOString();
    var expireDate = "2099-12-31T23:59:59Z";
    var purchaseDate = "2024-01-01T00:00:00Z";
    var productId = "locket_gold_annual";

    obj = obj || {};
    obj.request_date = obj.request_date || now;
    obj.request_date_ms = obj.request_date_ms || Date.now();
    obj.subscriber = obj.subscriber || {};
    obj.subscriber.original_app_user_id = obj.subscriber.original_app_user_id || "locket_user";
    obj.subscriber.original_application_version = "1.0";
    obj.subscriber.first_seen = obj.subscriber.first_seen || purchaseDate;
    obj.subscriber.last_seen = now;
    obj.subscriber.management_url = null;
    obj.subscriber.non_subscriptions = obj.subscriber.non_subscriptions || {};
    obj.subscriber.other_purchases = obj.subscriber.other_purchases || {};
    obj.subscriber.subscriptions = obj.subscriber.subscriptions || {};
    obj.subscriber.entitlements = obj.subscriber.entitlements || {};

    var subPayload = {
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "billing_issues_detected_at": null,
        "period_type": "normal",
        "expires_date": expireDate,
        "grace_period_expires_date": null,
        "unsubscribe_detected_at": null,
        "original_purchase_date": purchaseDate,
        "purchase_date": purchaseDate,
        "store": "app_store"
    };

    var entPayload = {
        "grace_period_expires_date": null,
        "purchase_date": purchaseDate,
        "product_identifier": productId,
        "expires_date": expireDate
    };

    // Entitlement mapping (all common variants)
    obj.subscriber.entitlements["Gold"] = entPayload;
    obj.subscriber.entitlements["gold"] = entPayload;

    // Subscriptions mapping (all common identifiers)
    obj.subscriber.subscriptions["locket_gold_annual"] = subPayload;
    obj.subscriber.subscriptions["locket_gold_yearly"] = subPayload;
    obj.subscriber.subscriptions["locket_gold_1year"] = subPayload;
    obj.subscriber.subscriptions["com.locket.gold.yearly"] = subPayload;
    obj.subscriber.subscriptions["com.locket.gold.annual"] = subPayload;
    obj.subscriber.subscriptions["com.locket.gold.1year"] = subPayload;

    $done({ body: JSON.stringify(obj) });
}
