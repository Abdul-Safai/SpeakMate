<?php
$hash = '$2y$10$i9E7xddA1hx9bFKWNGobBeQGlaUtDhkTa7ZOphqHXh3O.ahBgFnv2';
var_dump(password_verify('Secret123!', $hash));
