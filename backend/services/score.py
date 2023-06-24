
from decimal import Decimal

# Results are a key value dict with each check as its called in DB, 
# with the results of that check as the value
def pointsResults(results,pointsystem):
    points = 0
    # for each check in points system - Names of checks
    for check in pointsystem:
        pointsint = check[1]
        multiplier = check[2]
        deduction = check[4]
        checkResult = results.get(check[0])
        # CPU exception
        if check[0] == 'cpu_time':
            points += pointsint*multiplier if Decimal(checkResult) <= Decimal('0.3') else - deduction
        elif check[0] == 'rounds_availability':
                points += Decimal(26.5)
        # For all other scores
        else:
            if checkResult is False:
                points -= deduction
            elif checkResult is None:
                pass
            else:
                points += pointsint*multiplier
    #Add points for no rounds missed - temporary for now
    return points