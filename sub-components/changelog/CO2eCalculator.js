'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { Activity, RotateCcw, Save, Trash2 } from 'react-feather';

const STORAGE_KEY = 'atmoscan:co2e-calculator';

const GAS_FIELDS = [
  { key: 'co2', label: 'Dioxyde de carbone (CO2)', factor: 1, placeholder: '0' },
  { key: 'ch4', label: 'Methane (CH4)', factor: 28, placeholder: '0' },
  { key: 'n2o', label: "Protoxyde d'azote (N2O)", factor: 265, placeholder: '0' }
];

const INITIAL_VALUES = {
  co2: '',
  ch4: '',
  n2o: ''
};

const toNumber = (value) => {
  const normalized = String(value ?? '')
    .replace(',', '.')
    .trim();

  if (!normalized) return 0;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const computeCo2e = (values) =>
  GAS_FIELDS.reduce((total, field) => total + toNumber(values[field.key]) * field.factor, 0);

const CO2eCalculator = () => {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [history, setHistory] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setValues({ ...INITIAL_VALUES, ...(parsed.values || {}) });
        setHistory(Array.isArray(parsed.history) ? parsed.history.slice(0, 5) : []);
      }
    } catch (error) {
      console.error('Erreur de lecture localStorage CO2e', error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          values,
          history
        })
      );
    } catch (error) {
      console.error('Erreur de sauvegarde localStorage CO2e', error);
    }
  }, [history, hydrated, values]);

  const result = useMemo(() => computeCo2e(values), [values]);

  const handleChange = (key, nextValue) => {
    setValues((current) => ({
      ...current,
      [key]: nextValue
    }));
  };

  const handleSave = () => {
    const entry = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      values: {
        ch4: toNumber(values.ch4),
        co2: toNumber(values.co2),
        n2o: toNumber(values.n2o)
      },
      result: computeCo2e(values)
    };

    setHistory((current) => [entry, ...current].slice(0, 5));
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <Row className="mb-4">
      <Col lg={12} md={12} sm={12}>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <Row className="g-4">
              <Col xl={4} lg={5}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="icon-shape icon-lg bg-primary bg-opacity-10 text-primary rounded-3">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="mb-1">Calculatrice CO<sub>2</sub>e</h3>
                    <p className="mb-0 text-muted">
                      Reprise du calcul utilise dans la fiche entreprise.
                    </p>
                  </div>
                </div>

                <div className="bg-light rounded-3 p-3">
                  <div className="text-uppercase fs-6 fw-semibold text-muted mb-2">Resultat estime</div>
                  <div className="display-6 fw-bold text-primary mb-2">{(result* 0.001).toFixed(2)} tCO<sub>2e</sub></div>
                  <Badge bg="light" text="dark" className="border">
                    CO<sub>2</sub>e = (CO<sub>2</sub> x 1) + (CH<sub>4</sub> x 28) + (N<sub>2</sub>O x 265)
                  </Badge>
                </div>
                <br />
                <div className="bg-light rounded-3 p-3">
                  <div className="text-uppercase fs-6 fw-semibold text-muted mb-2">Cout carbone</div>
                  <div className="display-6 fw-bold text-primary mb-2">{(result * 0.001 * 5).toFixed(2)} $</div>
                  <Badge bg="light" text="dark" className="border">
                    CO<sub>2</sub>e [t] * 5 [$] (prix moyen du marché du carbone en 2024)
                  </Badge>
                </div>
              </Col>

              <Col xl={8} lg={7}>
                <Row className="g-3">
                  {GAS_FIELDS.map((field) => (
                    <Col md={12} key={field.key}>
                      <Form.Group controlId={`co2e-${field.key}`}>
                        <Form.Label className="fw-semibold mb-1">{field.label}</Form.Label>
                        <Form.Control
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min="0"
                          placeholder={field.placeholder}
                          value={values[field.key]}
                          onChange={(event) => handleChange(field.key, event.target.value)}
                        />
                        <Form.Text className="text-muted">
                          Facteur de conversion: {field.factor}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  ))}
                </Row>

                <div className="d-flex flex-wrap gap-2 mt-4">
                  <Button variant="primary" onClick={handleSave}>
                    <Save size={16} className="me-2" />
                    Memoriser
                  </Button>
                  <Button variant="outline-secondary" onClick={handleReset}>
                    <RotateCcw size={16} className="me-2" />
                    Reinitialiser
                  </Button>
                  <Button variant="outline-danger" onClick={handleClearHistory} disabled={!history.length}>
                    <Trash2 size={16} className="me-2" />
                    Vider l&apos;historique
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={12} md={12} sm={12} className="mt-10 mt-lg-8">
        <Card className="border-0 shadow-sm h-100">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h4 className="mb-1">Historique local</h4>
                <p className="mb-0 text-muted">5 derniers calculs memorises dans ce navigateur.</p>
              </div>
            </div>

            {history.length ? (
              <div className="table-responsive">
                <Table hover className="align-middle text-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>CO<sub>2</sub>e</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="fw-semibold">{new Date(item.createdAt).toLocaleDateString('fr-FR')}</div>
                          <small className="text-muted">
                            CH<sub>4</sub> {item.values.ch4} | CO<sub>2</sub> {item.values.co2} | N<sub>2</sub>O {item.values.n2o}
                          </small>
                        </td>
                        <td className="fw-bold text-primary">{item.result.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="rounded-3 bg-light text-muted p-3">
                Aucun calcul memorise pour le moment.
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CO2eCalculator;
