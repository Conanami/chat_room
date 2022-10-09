mkdir ..\chat_room
cd ..
mkdir .\chat_room\js
mkdir .\chat_room\css
mkdir .\chat_room\static
move .\js\*.* .\chat_room\js\
move .\css\*.* .\chat_room\css\
move .\static\config.js .\chat_room\static\
copy favicon.ico .\chat_room\
copy index.html .\chat_room\
rmdir css
rmdir js