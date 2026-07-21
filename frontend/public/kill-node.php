<?php
// Simple script to kill any hanging/orphaned node or prisma processes 
// that might be exhausting the cPanel NPROC limit (25).

header('Content-Type: text/plain');

echo "Current user: " . shell_exec('whoami') . "\n";
echo "Initial NPROC usage check:\n";
echo shell_exec('ps -u $(whoami) -o pid,ppid,cmd') . "\n";

echo "Attempting to kill hanging Node and Prisma processes...\n";
$output1 = shell_exec('pkill -u $(whoami) -f node 2>&1');
$output2 = shell_exec('pkill -u $(whoami) -f prisma 2>&1');

echo "Result:\n";
echo "Node kill: " . ($output1 ? $output1 : "Command run successfully") . "\n";
echo "Prisma kill: " . ($output2 ? $output2 : "Command run successfully") . "\n";

echo "\nNPROC usage after kill:\n";
echo shell_exec('ps -u $(whoami) -o pid,ppid,cmd') . "\n";
echo "\nNow restart the Node App inside cPanel and try accessing the site again.";
?>
