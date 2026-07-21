<?php
// Simple extraction script to bypass CloudLinux LVE limits and Passenger interceptions.
$zip = new ZipArchive;
if ($zip->open('/home/clickeat/nodeapp/backend.zip') === TRUE) {
    // Extract everything to the nodeapp directory
    $zip->extractTo('/home/clickeat/nodeapp/');
    $zip->close();
    
    // Delete the temporary zip archive
    unlink('/home/clickeat/nodeapp/backend.zip');
    echo 'UNZIP_SUCCESS';
} else {
    echo 'UNZIP_FAILED';
}

// Clean up deployment folder
if (file_exists(__DIR__ . '/.htaccess')) {
    unlink(__DIR__ . '/.htaccess');
}
unlink(__FILE__);
rmdir(__DIR__);
?>
