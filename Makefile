.PHONY: help setup test dev dev-backend dev-frontend clean docker-prod

# Colors for terminal output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "$(CYAN)Offerify - Available Commands:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

check-env: ## Check and create .env files if missing
	@echo "$(CYAN)Checking environment files...$(NC)"
	@if [ ! -f backend/.env ]; then \
		echo "$(YELLOW)Creating backend/.env from .env.example$(NC)"; \
		cp backend/.env.example backend/.env; \
	fi
	@if [ ! -f frontend/.env ]; then \
		echo "$(YELLOW)Creating frontend/.env from .env.example$(NC)"; \
		cp frontend/.env.example frontend/.env; \
	fi
	@echo "$(GREEN)✓ Environment files ready$(NC)"

install: ## Install dependencies for backend and frontend
	@echo "$(CYAN)Installing dependencies...$(NC)"
	@cd backend && npm install
	@cd frontend && npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

docker-up: ## Start Docker services (DB, Redis, Typesense)
	@echo "$(CYAN)Starting Docker services...$(NC)"
	@docker-compose up -d
	@echo "$(YELLOW)Waiting for databases to be ready...$(NC)"
	@sleep 5
	@echo "$(GREEN)✓ Docker services running$(NC)"

migrate: ## Run database migrations
	@echo "$(CYAN)Running migrations...$(NC)"
	@cd backend && npm run migration:run
	@echo "$(GREEN)✓ Migrations complete$(NC)"

seed: ## Seed database with initial data
	@echo "$(CYAN)Seeding database...$(NC)"
	@cd backend && npm run seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

setup: check-env install docker-up migrate seed ## Complete setup (env + install + DBs + migrations + seed)
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)✓ Setup complete!$(NC)"
	@echo "$(GREEN)========================================$(NC)"
	@echo ""
	@echo "$(CYAN)To start development:$(NC)"
	@echo "  make dev        # Run full stack"
	@echo "  make dev-backend  # Run backend only"
	@echo "  make dev-frontend # Run frontend only"

test-unit: ## Run backend unit tests only
	@echo "$(CYAN)Running unit tests...$(NC)"
	@cd backend && npm test
	@echo "$(GREEN)✓ Unit tests passed$(NC)"

test-e2e: ## Run backend E2E tests
	@echo "$(CYAN)Running E2E tests...$(NC)"
	@cd backend && npm run test:e2e
	@echo "$(GREEN)✓ E2E tests passed$(NC)"

test: test-unit test-e2e ## Run all backend tests (unit + E2E)

dev: setup test-unit ## Full development workflow (setup + unit tests + run)
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)Starting development servers...$(NC)"
	@echo "$(GREEN)========================================$(NC)"
	@npx concurrently -n "BACKEND,FRONTEND" -c "blue,magenta" \
		"cd backend && npm run start:dev" \
		"cd frontend && npx expo start --web"

dev-backend: setup ## Run only backend in development mode
	@echo "$(CYAN)Starting backend...$(NC)"
	@cd backend && npm run start:dev

dev-frontend: setup ## Run only frontend in development mode
	@echo "$(CYAN)Starting frontend...$(NC)"
	@cd frontend && npx expo start --web

clean: ## Stop Docker and clean build artifacts
	@echo "$(RED)Cleaning up...$(NC)"
	@docker-compose down -v
	@rm -rf backend/node_modules backend/dist
	@rm -rf frontend/node_modules frontend/dist frontend/.expo
	@rm -f backend/.env frontend/.env
	@echo "$(GREEN)✓ Cleaned$(NC)"

docker-prod: ## Build and run production stack with Docker
	@echo "$(CYAN)Building production images...$(NC)"
	@docker-compose -f docker-compose.prod.yml up -d --build
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)✓ Production stack running!$(NC)"
	@echo "$(GREEN)========================================$(NC)"
	@echo ""
	@echo "$(CYAN)Frontend:$(NC) http://localhost"
	@echo "$(CYAN)Backend API:$(NC) http://localhost:3000/api"

docker-prod-down: ## Stop production Docker stack
	@docker-compose -f docker-compose.prod.yml down

logs: ## View Docker logs
	@docker-compose logs -f

logs-prod: ## View production Docker logs
	@docker-compose -f docker-compose.prod.yml logs -f
