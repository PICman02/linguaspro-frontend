import express from "express";
import { authenticate } from "./auth.middleware.js"; // seu middleware JWT
import { body, validationResult } from "express-validator";

const router = express.Router();

// Mock de banco de dados (substitua por Firestore/MongoDB)
let orcamentosDB = [];

/**
 * POST /orcamentos
 * Solicita??o de orçamento
 * Protegido por JWT
 */
router.post(
  "/orcamentos",
  authenticate, // só usuários logados podem acessar
  [
    body("servico").notEmpty().withMessage("Serviço é obrigatório"),
    body("nome").notEmpty().withMessage("Nome é obrigatório"),
    body("email").isEmail().withMessage("Email inválido"),
    body("detalhes").optional().isString(),
    body("telefone").optional().isString()
  ],
  (req, res) => {
    // Valida??o dos campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { servico, nome, email, telefone, detalhes } = req.body;

    // Criar registro do orçamento
    const novoOrcamento = {
      id: orcamentosDB.length + 1,
      userId: req.user.id,
      servico,
      nome,
      email,
      telefone: telefone || "",
      detalhes: detalhes || "",
      dataCriacao: new Date().toISOString()
    };

    // Salvar no "banco"
    orcamentosDB.push(novoOrcamento);

    console.log("Novo orçamento:", novoOrcamento);

    res.status(201).json({ success: true, message: "Orçamento enviado com sucesso!" });
  }
);

export default router;
