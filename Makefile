.PHONY: dev build check stop status logs doctor format db-start db-stop

dev:
	python3 scripts/dev.py up --build
build:
	python3 scripts/dev.py build
check:
	python3 scripts/dev.py check
stop:
	python3 scripts/dev.py down
status:
	python3 scripts/dev.py status
logs:
	python3 scripts/dev.py logs
doctor:
	python3 scripts/dev.py doctor
format:
	python3 scripts/dev.py format
db-start:
	python3 scripts/local-db.py start
db-stop:
	python3 scripts/local-db.py stop
