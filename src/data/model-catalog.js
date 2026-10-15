// Pinned public model artifacts. Hashes are from the revision's verified HF metadata.
export const MODEL_CATALOG = [
  {
    key: "speech",
    id: "onnx-community/whisper-tiny",
    revision: "ff4177021cc41f7db950912b73ea4fdf7d01d8e7",
    label: "Whisper tiny · French/German speech",
    variant: "fp32-encoder-q8-decoder",
    dtype: { encoder_model: "fp32", decoder_model_merged: "q8" },
    source: "https://huggingface.co/onnx-community/whisper-tiny",
    files: [
      {
        path: "added_tokens.json",
        bytes: 34604,
        gitSha1: "e3d256c988462aa153dcabe2aa38b8e9b436c06f",
      },
      {
        path: "config.json",
        bytes: 2243,
        gitSha1: "4497848d6f637bd64ee2105fe92e67721e412c98",
      },
      {
        path: "generation_config.json",
        bytes: 3772,
        gitSha1: "3f732b9ea02e0199280d759824e51b6a150de9f9",
      },
      {
        path: "onnx/decoder_model_merged_quantized.onnx",
        bytes: 30719241,
        sha256:
          "25e807a962b6349356d0ea5d0dfe530b7e5bf0e2a484aeca0359d03143faddd3",
      },
      {
        path: "onnx/encoder_model.onnx",
        bytes: 32904992,
        sha256:
          "6642befb640f950d4a8cbbd17834d59e7e75f575b81ccf213e06b050623ab1dd",
      },
      {
        path: "preprocessor_config.json",
        bytes: 339,
        gitSha1: "91876762a536a746d268353c5cba57286e76b058",
      },
      {
        path: "special_tokens_map.json",
        bytes: 2194,
        gitSha1: "bf69932dca4b3719b59fdd8f6cc1978109509f6c",
      },
      {
        path: "tokenizer.json",
        bytes: 2480466,
        gitSha1: "1e95340ff836fad1b5932e800fb7b8c5e6d78a74",
      },
      {
        path: "tokenizer_config.json",
        bytes: 282683,
        gitSha1: "d13b786c04765fb1a06492b53587752cd67665ea",
      },
      {
        path: "vocab.json",
        bytes: 1036584,
        gitSha1: "90e797dd4fd05d9dea443d702ca06be2463c5f2f",
      },
    ],
    bytes: 67467118,
  },
  {
    key: "fr-en",
    id: "Xenova/opus-mt-fr-en",
    revision: "6b166a182780e118c997879d0ad5be4b53671644",
    label: "French → English subtitle translation",
    source: "https://huggingface.co/Xenova/opus-mt-fr-en",
    files: [
      {
        path: "config.json",
        bytes: 1411,
        gitSha1: "c313d87894f90a99ec40f30eccd85c1210d84ae9",
      },
      {
        path: "generation_config.json",
        bytes: 293,
        gitSha1: "22387016535f6300a9f8c5b68055b5c0ffe5cc34",
      },
      {
        path: "onnx/decoder_model_merged_quantized.onnx",
        bytes: 57381512,
        sha256:
          "73bc7ac8e29c42e6f212ebcc29a2991d3646a04aabb642c0036aa54b40e4e1a9",
      },
      {
        path: "onnx/encoder_model_quantized.onnx",
        bytes: 50090398,
        sha256:
          "e727cb26ac6bf816394c49671af69c9ae5798868fed1e40849872415dffc1772",
      },
      {
        path: "special_tokens_map.json",
        bytes: 74,
        gitSha1: "79ae7ea5bf033de69d0055820c57885e3d377bbb",
      },
      {
        path: "tokenizer.json",
        bytes: 5637839,
        gitSha1: "75a7ff0cd7f07b02bf1bada7aaebb78a3df6ab0c",
      },
      {
        path: "tokenizer_config.json",
        bytes: 280,
        gitSha1: "c57f3cfa62783a8fc57f2c695cc45909df78eeb0",
      },
      {
        path: "vocab.json",
        bytes: 1458196,
        gitSha1: "80a0a4d0f2a21df372ac2595bbb348444d9fbb07",
      },
    ],
    bytes: 114570003,
  },
  {
    key: "de-en",
    id: "Xenova/opus-mt-de-en",
    revision: "399dfd68706739fffd503f876093e455ae268a06",
    label: "German → English subtitle translation",
    source: "https://huggingface.co/Xenova/opus-mt-de-en",
    files: [
      {
        path: "config.json",
        bytes: 1376,
        gitSha1: "27f00c653f028b409f10f59b9aa22b855bd463a4",
      },
      {
        path: "generation_config.json",
        bytes: 293,
        gitSha1: "a99b643eda6cb47bdb49c9cf5408c689461e5419",
      },
      {
        path: "onnx/decoder_model_merged_quantized.onnx",
        bytes: 56652404,
        sha256:
          "4712800584b2d77c2f9e620bf29523e2b20b62f65ade5011ee01780e2b0ea5d3",
      },
      {
        path: "onnx/encoder_model_quantized.onnx",
        bytes: 49366942,
        sha256:
          "4cedda8f8c89b72a42b3c6cd1e7a27f2de24457093e3bf80cb3e46829641fcd8",
      },
      {
        path: "special_tokens_map.json",
        bytes: 74,
        gitSha1: "79ae7ea5bf033de69d0055820c57885e3d377bbb",
      },
      {
        path: "tokenizer.json",
        bytes: 5498450,
        gitSha1: "e9f5162c6f280e93955b4cadaddb0b8645fa94c7",
      },
      {
        path: "tokenizer_config.json",
        bytes: 280,
        gitSha1: "0222f6d9e1e3cc16a3a48b2c6e95beec38bb0171",
      },
      {
        path: "vocab.json",
        bytes: 1389436,
        gitSha1: "13d464a333d4582c869c0a46a69b78064c6eb418",
      },
    ],
    bytes: 112909255,
  },
];
