import { api_base } from "../config";
import axios from "axios";
import { getItemScore } from '../functions/scoring'

// Update row in database - now generic
const updateDb = (operation, type, payload, tableTitle, pointSystem) => {
 
    if (operation === 'delete') {
        if(tableTitle === 'Guild Settings'){
            payload.owner_name = payload.guild_name;  // guild_name is the same as owner_name.
        } 
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
    if (operation === 'update' || operation === 'create') {
        const date_updated = new Date();
        const score = +payload.score >=1 ? payload.score : operation === 'create' && !!pointSystem ? getItemScore(payload, pointSystem, type) : 0;
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
                analytics_url,
                spec_url,
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
                    analytics_url,
                    spec_url,
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
                owner_name, date_check, comments, score
            } = payload;
            axios
                .post(api_base + "/api/snapshotResultCommentUpdate", {
                    owner_name, date_check, comments, score: parseFloat(score)
                })
                .then(() => {
                    console.log(
                        `Comments and/or score on tech result for ${owner_name} updated! Reload to confirm.`
                    );
                });
        } else if (tableTitle === "Point System") {
            const {
                points_type, points, multiplier, min_requirements
            } = payload;
            axios
                .post(api_base + "/api/updatePointSystem", {
                    points_type, points, multiplier, min_requirements
                })
                .then(() => {
                    console.log(
                        `Points/multiplier for ${points_type} updated! Reload to confirm.`
                    );
                });
        } else if (tableTitle === "Guild Settings") {
            const {
                account_name, guild_name, active
            } = payload;
            axios
                .put(api_base + "/api/updateProducer/" + guild_name, {
                    account_name, active
                })
                .then(() => {
                    console.log(
                        `Guild updated - ${guild_name}. Account name ${account_name}, active state ${active}. Reload to confirm.`
                    );
                });
        } else if (type === "guild") {
            const {
                account_name, guild_name, url
            } = payload;
            const owner_name = guild_name;
            axios
                .post(api_base + "/api/addNewGuild", {
                    owner_name, url, account_name
                })
                .then(() => {
                    console.log(
                        `Guild added - ${owner_name}. Reload to confirm.`
                    );
                });
        } else {
            console.log(`Update: Unknown table type "${tableTitle}"...`);
        }
    }
};

export default updateDb