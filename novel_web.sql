# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.7.21)
# Database: novel_web
# Generation Time: 2018-03-25 15:18:15 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table book
# ------------------------------------------------------------

DROP TABLE IF EXISTS `book`;

CREATE TABLE `book` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `name` char(20) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `author` char(20) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `url` char(100) CHARACTER SET utf8 DEFAULT NULL,
  `source_id` int(4) DEFAULT '1',
  `update_time` bigint(10) NOT NULL DEFAULT '0',
  `remark` text CHARACTER SET utf8,
  PRIMARY KEY (`id`),
  KEY `type` (`source_id`),
  CONSTRAINT `type` FOREIGN KEY (`source_id`) REFERENCES `book_source` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `book` WRITE;
/*!40000 ALTER TABLE `book` DISABLE KEYS */;

INSERT INTO `book` (`id`, `name`, `author`, `url`, `source_id`, `update_time`, `remark`)
VALUES
	(4,'哈哈哈','1231','http://www.fs.com',2,1521980282583,'asd'),
	(5,'呵呵','戴强','http://www.baidu.com',2,1521980582169,'asda');

/*!40000 ALTER TABLE `book` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table book_source
# ------------------------------------------------------------

DROP TABLE IF EXISTS `book_source`;

CREATE TABLE `book_source` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `name` char(20) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `book_source` WRITE;
/*!40000 ALTER TABLE `book_source` DISABLE KEYS */;

INSERT INTO `book_source` (`id`, `name`)
VALUES
	(1,'暂无类型'),
	(2,'爱去小说网');

/*!40000 ALTER TABLE `book_source` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
