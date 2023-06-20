


ALTER TABLE oig.pointsystem
ADD COLUMN points_deduct SMALLINT;


INSERT INTO oig.pointsystem 
(points_type, points, multiplier, min_requirements, points_deduct) 
VALUES 
('rounds_availability', 2, 13.25, false, 25);


DELETE FROM oig.pointsystem WHERE points_type = 'website';

UPDATE oig.pointsystem
SET multiplier = 0, points_deduct = 0
WHERE points_type = 'minimum-points';

UPDATE oig.pointsystem
SET multiplier = 0, points_deduct = 5
WHERE points_type = 'http_check';

UPDATE oig.pointsystem
SET multiplier = 0, points_deduct = 5
WHERE points_type = 'http2_check';

UPDATE oig.pointsystem
SET multiplier = 0, points_deduct = 5
WHERE points_type = 'cors_check';

UPDATE oig.pointsystem
SET multiplier = 0, points_deduct = 5
WHERE points_type = 'seed_node';

UPDATE oig.pointsystem
SET multiplier = 0, points_deduct = 5
WHERE points_type = 'https_check';

UPDATE oig.pointsystem
SET multiplier = 0, points_deduct = 0
WHERE points_type = 'chains_json';


UPDATE oig.pointsystem
SET multiplier = 0, points_deduct = 5
WHERE points_type = 'wwwjson';

UPDATE oig.pointsystem
SET multiplier = 13.25, points_deduct = 0, points=0
WHERE points_type = 'hyperion_v2_testnet_full';

UPDATE oig.pointsystem
SET multiplier = 13.25, points_deduct = 0, points=1
WHERE points_type = 'hyperion_v2_testnet';

UPDATE oig.pointsystem
SET multiplier = 13.25, points_deduct = 0, points=0
WHERE points_type = 'full_history';

UPDATE oig.pointsystem
SET multiplier = 0, points_deduct = 120
WHERE points_type = 'wax_json';

UPDATE oig.pointsystem
SET multiplier = 13.25, points_deduct = 0, points=2
WHERE points_type = 'hyperion_v2';

UPDATE oig.pointsystem
SET multiplier = 13.25, points_deduct = 0, points=2
WHERE points_type = 'hyperion_v2_full';

UPDATE oig.pointsystem
SET multiplier = 13.25, points_deduct = 0, points=1
WHERE points_type = 'atomic_api';

UPDATE oig.pointsystem
SET multiplier = 0, points_deduct = 5
WHERE points_type = 'api_node';

UPDATE oig.pointsystem
SET multiplier = 0, points_deduct = 25
WHERE points_type = 'cpu_time';

UPDATE oig.pointsystem
SET multiplier = 13.25, points_deduct = 5
WHERE points_type = 'oracle_feed';

