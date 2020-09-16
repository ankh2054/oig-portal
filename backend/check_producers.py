import re

re1 = r'.*producer_plugin.cpp.*] Produced block .* (#\d+) @.*'

t_producing_block = 0 # the latest time of producing block

def log_info(msg):
    print "INFO: " + now() + "  " + msg
    logging.info("  " + now() + "  " + msg)

Look for top21

# -- LogParser --
def log_parse(line):
    # Create global variable called t_producing_block
    global t_producing_block
    res1 = re.match(re1, line) # Match the line using regex re1
    if res1:
        t_producing_block = time.time()
        log_info("  ******* Produce block " + res1.group(1) + " ********")


class LogParser(threading.Thread):
    def run(self):
        log_info("Run thread LogParser")
        while True:
            try:
                for line in tail("-n", 1, "-f", eosio_log_file, _iter=True):
                    log_parse(line)
            except:
                log_err("eosio log file:" + eosio_log_file + " parse failed!")
            time.sleep(10)