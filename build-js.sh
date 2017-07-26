#!/bin/bash
#Program:
# 用於將 revel view 中的 js 用 Google Closure Compiler 進行優化
#e-mail:
# zuiwuchang@gmail.com


function ShowHelp(){
	echo "help				: show help"
	echo "clean		rootpath	: rm all *.min.js"
	echo "build		rootpath	: build *.js to *.min.js"
	echo "build-one	jspath		: build a js file to *.min.js"
	echo "build-js	src dist	: build src to dist"
}

function CleanFilter(){
	if [[ $1 == *.min.js ]]
	then
		echo "---	rm $1	---"
		rm $1

		ok=$?
		if [[ $ok != 0 ]];then
			exit $ok
		fi
	fi
}
function Clean(){
	if [[ $1 == "" ]]
	then
		ShowHelp
		exit 1
	fi

	echo "***	clean begin	***"
	find $1 -name '*.js' | while read file;do CleanFilter $file;done
	
	ok=$?
	if [[ $ok != 0 ]]
	then
		exit $ok
	fi

	echo "***	clean success	***"
}

function Build(){
	if [[ $1 == "" ]]
	then
		ShowHelp
		exit 1
	fi

	echo "***	build begin	***"
	find $1 -name '*.js' | while read file
	do 
		BuildFilter $file
		ok=$?
		if [[ $ok != 0 ]];then
			exit $ok
		fi
	done
	
	ok=$?
	if [[ $ok != 0 ]];then
		exit $ok
	fi

	echo "***	build success	***"
}
function BuildOne(){
	if [[ $1 == "" ]]
	then
		ShowHelp
		exit 1
	fi

	if [[ $1 != *.js ]]
	then
		echo "jspath must is *.js"
		exit 1
	fi

	echo "***	build-one begin	***"
	BuildFilter $1
	ok=$?
	if [[ $ok != 0 ]];then
		exit $ok
	fi
	echo "***	build-one success	***"
}
function BuildJs(){
	if [[ $1 == "" ]]
	then
		echo "need srcfile"
		exit 1
	elif [[ $2 == "" ]]
	then
		echo "need distfile"
		exit 1
	fi

	echo "***	build-js begin	***"
	echo "---	build $1	---"
	java -jar $CLOSURE_COMPILER --js $1 --js_output_file $2

	ok=$?
	if [[ $ok != 0 ]];then
		exit $ok
	fi
	echo "***	build-js success	***"
}
function BuildFilter(){
	if [[ $1 == *.min.js ]]
	then
		return
	elif [[ $1 == *.test.js ]]
	then
		return
	fi

	declare -i len
	len=${#1}
	len=$len-3
	name=${1:0:len}

	echo "---	build $name.js	---"
	java -jar $CLOSURE_COMPILER --js $name.js --js_output_file $name.min.js 
}

ok=0
if [[ $1 == "build" ]];then 
	Build $2
	ok=$?
elif [[ $1 == "build-one" ]];then
	BuildOne $2
	ok=$?
elif [[ $1 == "build-js" ]];then
	BuildJs $2 $3
	ok=$?
elif [[ $1 == "clean" ]];then
	Clean $2
	ok=$?
elif [[ $1 == "help" ]];then
	ShowHelp
	ok=$?
else
	ShowHelp
	ok=$?
fi

exit $ok