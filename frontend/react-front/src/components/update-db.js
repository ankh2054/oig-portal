import { api_base } from "../config";
import axios from "axios";

// Update row in database - now generic
const updateDb = (operation, type, payload, tableTitle) => {
    if (operation === 'delete') {
        const { owner_name, name } = payload;
        axios
            .post(api_base + "/api/deleteItem", {
                type,
                owner_name,
                name
            })
            .then(() => {
                console.log(
                    `${type !== 'community' ? `${type} '${name}' by ` : 'Community points for'} ${owner_name} deleted! Reload to confirm.`
                );
            });
    }
    if (operation === 'update') {
        const date_updated = new Date();
        const score = payload.score ? payload.score : 0;
        if (type === "product") {
            const {
                owner_name,
                name,
                description,
                stage,
                analytics_url,
                spec_url,
                code_repo,
                points,
                comments
            } = payload;
            axios
                .post(api_base + "/api/productUpdate", {
                    owner_name,
                    name,
                    description: description ? description : "",
                    stage,
                    analytics_url,
                    spec_url,
                    code_repo,
                    score,
                    points: +points,
                    date_updated,
                    comments
                })
                .then(() => {
                    console.log(
                        `Product '${name}' by ${owner_name} updated! Reload to confirm.`
                    );
                });
        } else if (type === "bizdev") {
            const {
                owner_name,
                name,
                description,
                stage,
                points,
                comments
            } = payload;
            axios
                .post(api_base + "/api/bizdevUpdate", {
                    owner_name,
                    name,
                    description: description ? description : "",
                    stage,
                    score,
                    points: +points,
                    date_updated,
                    comments
                })
                .then(() => {
                    console.log(
                        `Bizdev '${name}' by ${owner_name} updated! Reload to confirm.`
                    );
                });
        } else if (type === "community") {
            const {
                owner_name,
                origcontentpoints,
                transcontentpoints,
                eventpoints,
                managementpoints,
                outstandingpoints,
                comments
            } = payload;
            axios
                .post(api_base + "/api/communityUpdate", {
                    owner_name,
                    origcontentpoints: +origcontentpoints,
                    transcontentpoints: +transcontentpoints,
                    eventpoints: +eventpoints,
                    managementpoints: +managementpoints,
                    outstandingpoints: +outstandingpoints,
                    score,
                    date_updated,
                    comments
                })
                .then(() => {
                    console.log(
                        `Community points for ${owner_name} updated! Reload to confirm.`
                    );
                });
        } else if (tableTitle === "Tech Snapshot" || tableTitle === "Snapshot Tech Results") {
            const {
                owner_name, date_check, comments
            } = payload;
            axios
                .post(api_base + "/api/snapshotResultCommentUpdate", {
                    owner_name, date_check, comments
                })
                .then(() => {
                    console.log(
                        `Comments on tech result for ${owner_name} updated! Reload to confirm.`
                    );
                });
        } else if (tableTitle === "Point System") {
            const {
                points_type, points, multiplier
            } = payload;
            axios
                .post(api_base + "/api/updatePointSystem", {
                    points_type, points, multiplier
                })
                .then(() => {
                    console.log(
                        `Points/multiplier for ${points_type} updated! Reload to confirm.`
                    );
                });
        } else {
            console.log(`Update: Unknown table type "${tableTitle}"...`);
        }
    }
};

export default updateDb