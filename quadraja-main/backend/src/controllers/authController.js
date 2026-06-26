import { authService } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authController = {
  cadastrarCliente: asyncHandler(async (req, res) => {
    const result = await authService.cadastrarCliente(req.body);
    res.status(201).json(result);
  }),

  loginCliente: asyncHandler(async (req, res) => {
    const result = await authService.loginCliente(req.body);
    res.json(result);
  }),

  loginGestor: asyncHandler(async (req, res) => {
    const result = await authService.loginGestor(req.body);
    res.json(result);
  }),

  // Retorna o usuario do token atual (cliente ou gestor).
  eu: asyncHandler(async (req, res) => {
    res.json({ usuario: req.user });
  }),
};
