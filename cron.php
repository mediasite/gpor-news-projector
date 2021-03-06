<?php 
$newsStatRootDir = dirname(__FILE__);

require ($newsStatRootDir.'/lib/NewsStatFeedParser.php');

$config = require($newsStatRootDir.'/config.php');

foreach ($config as $k=>$v)
{
	if (empty($v))
		die ("empty key ".$k);
}

$dataDir = $newsStatRootDir.'/data/';
if (!file_exists($dataDir))
{
	if (!mkdir($dataDir, 0777))
	{
		die('Can\'t create folder '.$dataDir);
	}
}


$pid = getmypid();
$lockFile = $newsStatRootDir.'/cron.lock';
if (file_exists($lockFile))
{
	$oldPid = file_get_contents($lockFile);
	if (posix_getsid($oldPid))
		die('process is running');

}
file_put_contents($lockFile, $pid);

// читаем новости из всех фидов и собираем из них ленту
$maxNews = $config['maxNewsOnPage'];

$parser = new NewsStatFeedParser ($pid, $config);
$allNews = array();
$feedsDir = $parser->getResultDir();
$dh  = opendir($feedsDir);
		
$n = 0;
$md5 = array();
while (false !== ($filename = readdir($dh)))
{
	if ($filename === '.' || $filename === '..')
		continue;
	$fullFilename = $feedsDir.'/'.$filename;
	if (is_dir($fullFilename))
		continue;
	if (strstr('.tmp.', $filename))
		continue;
	if (!preg_match('#\.json#', $filename))
		continue;
	
	$content = @file_get_contents($fullFilename);
	if ($content)
	{
		$data = @json_decode($content);
		if ($data && $data->items)
		{
			foreach ($data->items as $item)
			{
				if ($config['excludeFeeds'] && in_array($data->sourceLink, $config['excludeFeeds']))
					continue;
				if (strtotime($item->pubDate) > time())
					continue;
				if (isset($md5[md5($item->title)]))
					continue;
				$_item = array('pubDate'=>strtotime($item->pubDate), 'title'=>$item->title, 'link'=>$item->link);
				$_item['sourceName'] = $data->sourceName;
				$_item['sourceLink'] = $data->sourceLink;
				$allNews[] = $_item;
				$md5[md5($item->title)] = 1;
			}
		}
	}
}

if ($allNews)
{
	usort($allNews, "newsStatCustomSort");
	if (count($allNews) > $maxNews)
		$allNews = array_slice($allNews, 0, $maxNews);
}

if (newsStatSaveData('feeds', $allNews))
{
	echo 'feeds updated successfull'."\n";
}

unlink($lockFile);










/*
 * Вспомогательные ф-ции
 */
function newsStatSaveData($filName, $data)
{
	$resultFile = dirname(__FILE__).'/data/'.$filName.'.json';
	$tmpFile = dirname(__FILE__).'/data/'.$filName.'.tmp.json';
	if(!$handle = fopen($tmpFile, 'w+'))
	{
		echo 'Can\'t create file '.$tmpFile;
		return false;
	}
	fwrite($handle, json_encode($data));
	fclose($handle);
	if (file_exists($tmpFile)){
	    if (file_exists($resultFile)) unlink($resultFile);
    	copy($tmpFile, $resultFile);
    }
    unlink($tmpFile);
	return true;
}

function newsStatCustomSort($a,$b) {
	return $a['pubDate']<=$b['pubDate'];
}

?>