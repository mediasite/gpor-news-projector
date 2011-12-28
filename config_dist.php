<?php 
return array (
	'rootDir' => '', // абсолютный путь до www (включая www/)

	'phpPath' => '', // путь до php
	'maxStreamsCount' => 3, // максимальное кол-во процессов, которые может плодить парсер фидов
	'maxNewsOnPage' => 20, // максимальное кол-во новостей из фидов на финальной странице
	'maxNewsOnTop' => 10, // максимальное кол-во топовых новостей
	'days' => 60, // кол-во дней, за которые показывать график
	'sections' => array(
			0 => 'Общая статистика',
			3 => 'Бизнес',
			35 => 'Новости авто',
		), // из каких рубрик надо собирать статистику (id => name)
	'graphDelay' => 3, // за сколько предыдущих дней считать среднее
	// какие фиды не показывать в ленте
	'excludeFeeds' => array (
		'http://www.bankinform.ru/news/rss/?t=804'
	),

	'apiUrl' => '',
	'apiKey' => '',
	'refreshStatInterval' => 10,
	'refreshFeedInterval' => 15,
	'reloadPageInterval' => 60*60, // принудительная перезагрузка страницы
);
?>