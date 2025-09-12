import { Account } from './account';
import { Budget } from './budget';
import { Category } from './category';
import { CreditCard } from './credit-card';
import { CreditTransaction } from './credit-transaction';
import { Expense } from './expense';
import { Family } from './family';
import { Goal, GoalDeposit } from './goal';
import { Investment, InvestmentTransaction } from './investment';
import { PantryItem } from './pantry-item';
import { Product } from './product';
import { Purchase } from './purchase';
import { ShoppingList } from './shopping-list';
import { Store } from './store';
import { Plan, Subscription } from './subscription';

// Create types omit the database-generated _id but keep all other keys from the models
// Create types normally omit the database-generated _id, but we allow an optional
// _id (string UUID) to be provided by mappers when creating documents.
export type CreateProduct = Omit<Product, '_id'> & { _id?: string };
export type CreateCategory = Omit<Category, '_id'> & { _id?: string };
export type CreateExpense = Omit<Expense, '_id'> & { _id?: string };
export type CreateAccount = Omit<Account, '_id'> & { _id?: string };
export type CreateCreditCard = Omit<CreditCard, '_id'> & { _id?: string };
export type CreateBudget = Omit<Budget, '_id'> & { _id?: string };
export type CreateGoal = Omit<Goal, '_id'> & { _id?: string };
export type CreateGoalDeposit = Omit<GoalDeposit, '_id'> & { _id?: string };
export type CreateInvestment = Omit<Investment, '_id'> & { _id?: string };
export type CreateInvestmentTransaction = Omit<InvestmentTransaction, '_id'> & { _id?: string };
export type CreateSubscription = Omit<Subscription, '_id'> & { _id?: string };
export type CreatePlan = Omit<Plan, '_id'> & { _id?: string };
export type CreateCreditTransaction = Omit<CreditTransaction, '_id'> & { _id?: string };
export type CreateStore = Omit<Store, '_id'> & { _id?: string };
export type CreatePantryItem = Omit<PantryItem, '_id'> & { _id?: string };
export type CreatePurchase = Omit<Purchase, '_id'> & { _id?: string };
export type CreateShoppingList = Omit<ShoppingList, '_id'> & { _id?: string };
export type CreateFamily = Omit<Family, '_id'> & { _id?: string };
