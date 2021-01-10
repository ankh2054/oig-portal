def extract_values(obj, key):
    """Pull all values of specified key from nested JSON."""
    arr = []

    def extract(obj, arr, key):
        # Is the object of type dict 
        if isinstance(obj, dict):
            # Extract the values from the passed object
            for k, v in obj.items():
                # if the value is a dict or list
                if isinstance(v, (dict, list)):
                    # then pass the value back to extract function as the object
                    extract(v, arr, key)
                elif k == key:
                    # if the passed key equals the found key append to arr list
                    arr.append(v)
        # Is the object of type list
        elif isinstance(obj, list):
            for item in obj:
                # then pass the item back to extract function as the object
                extract(item, arr, key)
        return arr

    results = extract(obj, arr, key)
    return results