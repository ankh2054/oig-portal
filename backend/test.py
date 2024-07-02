from services.atomic import check_atomic_assets

if __name__ == "__main__":
    producer = "greeneosiobp"
    feature = "atomic-assets-api"
    result = check_atomic_assets(producer, feature)
    print(result)