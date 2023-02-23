
# Returns tuple list with producers in delphioracle True or False
def delphiresults2():
    # List of producers performing push actions in delphioracle
    producersoracle = delphioracle_actors()
    producersdb = db_connect.getProducers()
    # Create empty list
    found = []
    for producers in producersdb:
        prod = producers[0]
        if prod in producersoracle:
            thistuple = (prod, True)
            found.append(thistuple)
        else:
            thistuple = (prod, False)
            found.append(thistuple)
    return found