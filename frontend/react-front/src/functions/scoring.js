const getTechScore = (item, pointSystem) => {
    if (!pointSystem) {
        console.log("No pointsystem supplied. Returning blank score")
        return undefined
    }

    // Fairly inefficient... could be better
    let score = 0;
    // Otherwise, loop through the table headers, find their corresponding points and multiplier, and tally it up
    Object.keys(item).forEach((key => {
        // 0,0 for the last ones, since 0 times 0 is 0
        const [points, multiplier] = !!pointSystem[key] ? pointSystem[key] : [0, 0]
        score += points * multiplier;
    }))
    console.log(`${item.owner_name} tech score: ${score}`)

    return Math.round(score);
}

const addScoreToItem = (item, pointSystem, pointIdentifier) => {
    if (!pointSystem) {
        console.log("No pointsystem supplied. Returning item with blank score")
        return {
            ...item,
            score: undefined
        }
    }
    
    let score = undefined;

    if (pointIdentifier && pointSystem[pointIdentifier]) {
        const multiplier = pointSystem[pointIdentifier][1];
        if (item.points) {
            // This is a product or bizdev update (or achievement, when integrated)
            score = item.points * multiplier;
        } else if (pointIdentifier === 'community') {
            // A little complex to follow, but it:
            // Step 1: finds every table header that contains "points"
            // Step 2: finds all their values
            // Step 3: tallies them all up together
            const totalPoints = Object.keys(item).filter(columns => columns.indexOf('points') !== -1).map(key => {
                return item[key]
            }).reduce((accumulator, currentValue) => accumulator + currentValue)
            score = totalPoints * multiplier
        }
        console.log(`${item.owner_name} ${pointIdentifier} score: ${score}. ${item.name ? "(for " + item.name + ")" : ""}`)
    } else {
        score = getTechScore(item, pointSystem)
    }

    score = Math.round(score)

    return {
        ...item,
        score
    }
}

export {addScoreToItem, getTechScore}