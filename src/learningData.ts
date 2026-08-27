export type LessonVisual =
  | { type: 'variables'; items: { name: string; value: string; dataType: string; color: string }[] }
  | { type: 'operation'; left: string; operator: string; right: string; result: string }
  | { type: 'list'; values: string[]; activeIndex?: number }
  | { type: 'dictionary'; root: string; branches: { key: string; values: string[] }[] }
  | { type: 'array'; before: string[]; after: string[]; operation: string }
  | { type: 'function'; inputs: string[]; process: string; output: string }

export interface Lesson {
  id: string
  number: number
  title: string
  shortTitle: string
  eyebrow: string
  summary: string
  explanation: string
  financeConnection: string
  analogy: {
    title: string
    story: string
    mission: string
    scene: 'wallet' | 'scale' | 'train' | 'archive' | 'machine' | 'factory' | 'blueprint'
  }
  code: string
  visualTitle: string
  visual: LessonVisual
  keyIdeas: string[]
  challenge: {
    question: string
    options: string[]
    correctIndex: number
    hint: string
    explanation: string
  }
}

export const LESSONS: Lesson[] = [
  {
    id: 'variables',
    number: 1,
    title: 'Variables y tipos de datos',
    shortTitle: 'Variables',
    eyebrow: 'Guardar información',
    summary: 'Construye un plan de ahorro y observa por qué cada dato necesita un nombre y un tipo.',
    explanation:
      'Mientras movías los controles, el significado de ingreso y porcentaje permaneció estable, aunque sus valores cambiaron. Eso es una variable: un nombre estable para un dato que puede variar. Python infiere si el dato es entero, decimal, texto o lógico según el valor asignado.',
    financeConnection:
      'Un presupuesto necesita distinguir montos, porcentajes, categorías y respuestas de sí/no para poder calcular correctamente.',
    analogy: {
      title: 'Contenedores con nombre',
      story: 'Una variable se parece a un contenedor etiquetado. Al asignar un valor, Python lo coloca dentro; al reasignar, reemplaza el contenido, pero conserva el mismo nombre.',
      mission: 'Observa qué ocurre cuando ingreso recibe un valor nuevo mientras tasa_ahorro conserva el suyo.',
      scene: 'wallet',
    },
    code: `ingreso = 3200.0
tasa_ahorro = 10
meta = "viaje"
meta_activa = True

ahorro = ingreso * tasa_ahorro / 100
print(f"Ahorro para {meta}: S/ {ahorro:.2f}")`,
    visualTitle: 'Cada dato tiene un nombre y un tipo',
    visual: {
      type: 'variables',
      items: [
        { name: 'ingreso', value: '3200.0', dataType: 'float · decimal', color: 'sky' },
        { name: 'tasa_ahorro', value: '10', dataType: 'int · entero', color: 'violet' },
        { name: 'meta', value: '"viaje"', dataType: 'str · texto', color: 'emerald' },
        { name: 'meta_activa', value: 'True', dataType: 'bool · lógico', color: 'amber' },
      ],
    },
    keyIdeas: ['El nombre describe el dato.', 'El valor puede cambiar.', 'type(valor) revela su tipo.'],
    challenge: {
      question: '¿Cuál nombre comunica mejor que guardamos el porcentaje destinado al ahorro?',
      options: ['x', 'numero', 'tasa_ahorro'],
      correctIndex: 2,
      hint: 'Piensa en una persona que ve la fórmula por primera vez. ¿Con cuál nombre sabría de inmediato qué representa el valor, sin buscar una explicación adicional?',
      explanation: 'tasa_ahorro indica qué representa el valor 10. Al leer ahorro = ingreso * tasa_ahorro / 100, podemos comprender la operación sin tener que adivinar qué significa cada dato.',
    },
  },
  {
    id: 'operations',
    number: 2,
    title: 'Operaciones y booleanos',
    shortTitle: 'Operaciones',
    eyebrow: 'Calcular y comparar',
    summary: 'Calcula el retorno de una inversión y determina automáticamente si ganó o perdió valor.',
    explanation:
      'La resta y la división transformaron dos precios en un retorno. Las comparaciones convirtieron ese número en respuestas True o False. Finalmente, and combinó dos condiciones: solo aprobó la decisión cuando hubo ganancia y además se alcanzó la meta.',
    financeConnection:
      'Podemos calcular el valor de una posición y comprobar si supera un presupuesto o si una inversión generó ganancia.',
    analogy: {
      title: 'El semáforo del rendimiento',
      story: 'El precio de compra es el punto de partida. El precio actual mueve el indicador: verde si el retorno llega a cero o más, rojo si queda por debajo.',
      mission: 'Mueve el precio actual hasta conseguir exactamente un retorno de 10 %.',
      scene: 'scale',
    },
    code: `precio_compra = 48
precio_actual = 54

retorno = (precio_actual - precio_compra) / precio_compra
es_ganancia = retorno >= 0
cumple_meta = retorno >= 0.10
decision = es_ganancia and cumple_meta

print(f"Retorno: {retorno:.2%}")
print(f"¿Ganó valor? {es_ganancia}")
print(f"¿Cumple ambas condiciones? {decision}")`,
    visualTitle: 'Una comparación responde una pregunta',
    visual: { type: 'operation', left: '54', operator: '>', right: '48', result: 'True' },
    keyIdeas: ['- y / calculan el retorno.', '>= produce True o False.', 'and exige que ambas condiciones sean verdaderas.'],
    challenge: {
      question: 'Si el precio de compra fue 50 y el actual es 45, ¿retorno >= 0?',
      options: ['True', 'False', 'Depende del ticker'],
      correctIndex: 1,
      hint: 'Compara primero 45 con 50: si el precio actual es menor que el precio de compra, ¿el retorno queda por encima o por debajo de cero?',
      explanation: 'El retorno es negativo porque el precio actual es menor. Por tanto, la comparación con cero devuelve False.',
    },
  },
  {
    id: 'lists',
    number: 3,
    title: 'Listas e índices',
    shortTitle: 'Listas',
    eyebrow: 'Agrupar datos ordenados',
    summary: 'Representa la evolución mensual de un fondo y navega por sus posiciones sin crear cinco variables.',
    explanation:
      'Al seleccionar un mes usaste su posición para recuperar el saldo correspondiente. Una lista mantiene el orden y asigna un índice a cada elemento. Python comienza en cero porque el índice expresa cuántos pasos debe desplazarse desde el inicio.',
    financeConnection:
      'Una lista puede representar los precios de cierre de una acción durante varios días.',
    analogy: {
      title: 'La línea de tiempo del fondo',
      story: 'Cada estación representa un mes y conserva su lugar. Para llegar a marzo, Python avanza dos posiciones desde el punto inicial: por eso usa el índice 2.',
      mission: 'Selecciona distintos meses y anticipa qué índice mostrará Python.',
      scene: 'train',
    },
    code: `saldos = [1200, 1320, 1280, 1450, 1510]

saldo_inicial = saldos[0]
saldo_marzo = saldos[2]
saldos.append(1600)
crecimiento = saldos[-1] - saldo_inicial

print(f"Saldo de marzo: S/ {saldo_marzo}")
print(f"Crecimiento total: S/ {crecimiento}")`,
    visualTitle: 'Los índices empiezan en cero',
    visual: { type: 'list', values: ['1200', '1320', '1280', '1450', '1510'], activeIndex: 2 },
    keyIdeas: ['[0] accede al primer elemento.', '[-1] accede al último.', 'append agrega al final.'],
    challenge: {
      question: 'Con saldos = [1200, 1320, 1280], ¿qué devuelve saldos[-1]?',
      options: ['1200', '1320', '1280'],
      correctIndex: 2,
      hint: 'Los índices negativos cuentan desde el final. -1 significa “un lugar desde el final”, no el primer elemento de la lista.',
      explanation: 'El índice -1 permite acceder al último elemento, sin importar cuántos elementos tenga la lista.',
    },
  },
  {
    id: 'dictionaries',
    number: 4,
    title: 'Diccionarios financieros',
    shortTitle: 'Diccionarios',
    eyebrow: 'Relacionar claves y valores',
    summary: 'Construye una ficha de portafolio donde cada activo y cada característica se consultan por nombre.',
    explanation:
      'En la exploración no necesitaste recordar posiciones: elegiste BONOS y luego viste atributos con nombres como riesgo y peso. Un diccionario relaciona claves únicas con valores; esos valores pueden ser otros diccionarios y formar fichas estructuradas.',
    financeConnection:
      'Podemos relacionar cada ticker con su precio o guardar varios datos de cada activo.',
    analogy: {
      title: 'El archivador del portafolio',
      story: 'Cada carpeta se identifica por el tipo de inversión, no por un número. Dentro encuentras etiquetas que responden preguntas diferentes: riesgo, peso y liquidez.',
      mission: 'Compara las fichas y encuentra qué inversión no tiene liquidez inmediata.',
      scene: 'archive',
    },
    code: `portafolio = {
    "BONOS": {"riesgo": "bajo", "peso": 40, "liquido": True},
    "ETF": {"riesgo": "medio", "peso": 35, "liquido": True},
    "DEPOSITO": {"riesgo": "bajo", "peso": 25, "liquido": False}
}

riesgo_etf = portafolio["ETF"]["riesgo"]
portafolio["BONOS"]["peso"] = 45

print(f"Riesgo del ETF: {riesgo_etf}")
print(portafolio["BONOS"])`,
    visualTitle: 'Las claves describen el contenido',
    visual: {
      type: 'dictionary',
      root: 'portafolio',
      branches: [
        { key: 'BONOS', values: ['riesgo: bajo', 'peso: 40'] },
        { key: 'ETF', values: ['riesgo: medio', 'peso: 35'] },
      ],
    },
    keyIdeas: ['Las claves no se repiten.', 'Los valores sí pueden cambiar.', 'Un diccionario puede contener otros diccionarios.'],
    challenge: {
      question: '¿Cómo consultamos el riesgo del ETF?',
      options: ['portafolio[1][0]', 'portafolio["ETF"]["riesgo"]', 'portafolio.riesgo.ETF'],
      correctIndex: 1,
      hint: 'Los diccionarios se consultan con claves entre corchetes. Primero necesitas abrir la ficha del activo y después buscar un dato dentro de ella.',
      explanation: 'Primero accedemos a la ficha ETF y luego a la clave riesgo dentro de esa ficha.',
    },
  },
  {
    id: 'numpy',
    number: 5,
    title: 'Arrays y NumPy',
    shortTitle: 'NumPy',
    eyebrow: 'Calcular sobre muchos datos',
    summary: 'Simula un escenario de mercado sobre varios rendimientos sin modificar cada dato por separado.',
    explanation:
      'Cuando moviste el escenario, el mismo cambio se aplicó simultáneamente a todos los rendimientos. Esa operación vectorizada es la idea central de NumPy: expresar un cálculo sobre el array completo, sin escribir una repetición manual por cada elemento.',
    financeConnection:
      'Podemos aumentar todos los precios en 5 %, calcular su promedio o medir su dispersión sin recorrerlos manualmente.',
    analogy: {
      title: 'El simulador de escenarios',
      story: 'Un analista quiere saber qué pasaría si una noticia suma o resta algunos puntos a todos los rendimientos. El array completo atraviesa el mismo escenario.',
      mission: 'Prueba escenarios positivos y negativos; identifica cuándo cambia el signo de cada dato.',
      scene: 'machine',
    },
    code: `import numpy as np

rendimientos = np.array([-1.2, 0.8, 2.1, -0.4])
escenario = 2.0
rendimientos_simulados = rendimientos + escenario

promedio = np.mean(rendimientos_simulados)
dias_positivos = rendimientos_simulados > 0

print(rendimientos_simulados)
print(f"Promedio simulado: {promedio:.2f}%")
print(f"Días positivos: {dias_positivos}")`,
    visualTitle: 'La operación se aplica a cada elemento',
    visual: {
      type: 'array',
      before: ['-1.2', '0.8', '2.1', '-0.4'],
      after: ['0.8', '2.8', '4.1', '1.6'],
      operation: '+ 2.0',
    },
    keyIdeas: ['np.array crea un array.', 'Las operaciones actúan elemento por elemento.', 'mean resume y > compara cada dato.'],
    challenge: {
      question: '¿Qué produce rendimientos > 0 en NumPy?',
      options: ['Un único promedio', 'Un array de True y False', 'Solo los números positivos'],
      correctIndex: 1,
      hint: 'NumPy aplica la comparación a cada posición. Si entran cuatro rendimientos, piensa cuántas respuestas lógicas deberían salir.',
      explanation: 'La comparación se aplica elemento por elemento y produce un booleano por cada rendimiento.',
    },
  },
  {
    id: 'functions',
    number: 6,
    title: 'Funciones',
    shortTitle: 'Funciones',
    eyebrow: 'Dar nombre a un proceso',
    summary: 'Crea una calculadora de ahorro compuesto que funciona con cualquier capital, tasa y plazo.',
    explanation:
      'Cambiaste tres entradas y la calculadora repitió siempre la misma regla. Una función da nombre a esa regla, recibe valores mediante parámetros y devuelve un resultado. Esto separa qué queremos calcular de los datos concretos usados en cada llamada.',
    financeConnection:
      'La misma función permite proyectar distintas metas cambiando capital, tasa y plazo.',
    analogy: {
      title: 'La calculadora reutilizable',
      story: 'La calculadora no sabe de antemano cuánto invertirás ni por cuánto tiempo. Recibe esos datos, aplica la fórmula acordada y entrega una proyección.',
      mission: 'Encuentra una combinación que convierta S/ 1,000 en más de S/ 1,300.',
      scene: 'factory',
    },
    code: `def proyectar_ahorro(capital, tasa_anual, anios):
    tasa_decimal = tasa_anual / 100
    monto_final = capital * (1 + tasa_decimal) ** anios
    return monto_final

meta_viaje = proyectar_ahorro(1000, 8, 3)
fondo_estudios = proyectar_ahorro(2500, 6, 5)

print(f"Meta de viaje: S/ {meta_viaje:.2f}")
print(f"Fondo de estudios: S/ {fondo_estudios:.2f}")`,
    visualTitle: 'Entradas, proceso y salida',
    visual: {
      type: 'function',
      inputs: ['capital: 1000', 'tasa: 8', 'años: 3'],
      process: 'proyectar_ahorro()',
      output: '1259.71',
    },
    keyIdeas: ['def crea la función.', 'Los parámetros reciben datos.', 'return entrega el resultado.'],
    challenge: {
      question: 'En proyectar_ahorro(1000, 8, 3), ¿qué representa el número 8?',
      options: ['El valor devuelto', 'El argumento para tasa_anual', 'El nombre de la función'],
      correctIndex: 1,
      hint: 'Compara el orden de la llamada con la definición: capital es el primer parámetro, tasa_anual el segundo y anios el tercero.',
      explanation: 'En esa llamada, 8 ocupa la posición del parámetro tasa_anual. La función lo transforma luego en 0.08.',
    },
  },
  {
    id: 'classes',
    number: 7,
    title: 'Clases y objetos',
    shortTitle: 'Clases',
    eyebrow: 'Modelar entidades',
    summary: 'Crea cuentas independientes a partir de una misma plantilla y modifica su estado mediante métodos.',
    explanation:
      'La clase define qué datos y acciones tendrá un tipo de objeto. Cada instancia conserva sus propios atributos: depositar en una cuenta no cambia las demás. self identifica la instancia que está ejecutando el método.',
    financeConnection:
      'Una aplicación financiera puede modelar cuentas, préstamos o clientes con la misma estructura, pero con datos y movimientos independientes.',
    analogy: {
      title: 'Un plano, varias cuentas',
      story: 'La clase es el plano de una caja financiera. Con el mismo plano construimos dos cajas; ambas tienen titular y saldo, pero cada una guarda valores diferentes.',
      mission: 'Sigue el plano, crea dos objetos y observa qué cuenta cambia cuando llamamos al método depositar.',
      scene: 'blueprint',
    },
    code: `class Cuenta:
    def __init__(self, titular, saldo):
        self.titular = titular
        self.saldo = saldo

    def depositar(self, monto):
        self.saldo += monto

cuenta_ana = Cuenta("Ana", 800)
cuenta_luis = Cuenta("Luis", 1200)

cuenta_ana.depositar(200)

print(cuenta_ana.saldo)
print(cuenta_luis.saldo)`,
    visualTitle: 'La plantilla crea objetos independientes',
    visual: {
      type: 'function',
      inputs: ['titular', 'saldo'],
      process: 'Cuenta(...)',
      output: 'objeto',
    },
    keyIdeas: ['class define la plantilla.', '__init__ prepara cada objeto.', 'self apunta al objeto actual.'],
    challenge: {
      question: 'Si depositamos 200 en cuenta_ana, ¿qué ocurre con cuenta_luis.saldo?',
      options: ['También aumenta 200', 'No cambia', 'Se convierte en cero'],
      correctIndex: 1,
      hint: 'Las dos cuentas nacieron de la misma clase, pero son objetos distintos. Piensa dónde guarda cada instancia su atributo saldo.',
      explanation: 'No cambia. Cada instancia tiene su propio saldo; el método modifica únicamente el objeto que aparece antes del punto.',
    },
  },
]
