-- CreateTable
CREATE TABLE "merchants" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "txn_id" TEXT NOT NULL,
    "merchant_id" INTEGER,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "category" TEXT NOT NULL,
    "txn_date" DATE NOT NULL,
    "raw_description" TEXT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchants_normalized_name_key" ON "merchants"("normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_txn_id_key" ON "transactions"("txn_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
