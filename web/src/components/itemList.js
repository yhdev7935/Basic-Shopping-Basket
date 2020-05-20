import React, {Component} from 'react';
import {gql} from 'apollo-boost';
import {Query} from "react-apollo";
import {Container, Row, Col, Card, Button} from 'react-bootstrap';
import {getCurrencyRate} from 'currencies-exchange-rates';
import NumberFormat from "react-number-format";

const GET_ITEMS_QUERY = gql`
    query {
        getItems{
            name,
            price,
            imgUrl,
            select
        }
    }`;

class ItemList extends Component {
    constructor(props) {
        super(props);

        const items = [];
        const selected = [];
        const currency = [];
        this.state = {
            items: items,
            currency: currency,
            selected: selected,
        };
        this.rate = 0.001;
    }

    newArray = (arr, idx, val) => {
        let new_arr = [];
        for(let i = 0; i < arr.length; i++)
            new_arr.push(arr[i]);
        new_arr[idx] = val;
        return new_arr;
    }

    itemAdd = async event => {
        const idx = event.target.getAttribute('id');
        this.props.addItems(this.state.items[idx].price);
        await this.setState({
            selected: this.newArray(this.state.selected, idx, this.state.selected[idx] + 1),
        });
        await this.props.updateInfo(this.state.items, this.state.selected);
    }

    itemRemove = async event => {
        const idx = event.target.getAttribute('id');
        if(this.state.selected[idx] != 0) {
            this.props.removeItem(this.state.items[idx].price);
            await this.setState({
                selected: this.newArray(this.state.selected, idx, this.state.selected[idx] - 1),
            });
        }
        await this.props.updateInfo(this.state.items, this.state.selected);
    }

    currencyConvert = async event => {
        const idx = event.target.getAttribute('id');
        this.setState({
            currency: this.newArray(this.state.currency, idx, !this.state.currency[idx])
        });
        this.rate = (await getCurrencyRate('KRW', 'USD')).rates.USD;
    }

    itemCard = () => {
        const cards = [];
        for(let i = 0; i < this.state.items.length; i++){
            cards.push(<Col sm={6}>
                <Card style={{ marginBottom: '10px' }}>
                    <Card.Img variant="top" src={this.state.items[i].imgUrl} style={{width: '100%', height: '20vw', objectFit: 'cover'}} />
                <Card.Body>
                    <Card.Title>{this.state.items[i].name}</Card.Title>
                    <Card.Text>
                        <NumberFormat value={this.state.items[i].price * (this.state.currency[i] ? this.rate : 1)} displayType={'text'} thousandSeparator={true} prefix={this.state.currency[i] ? '$' : '₩'} />
                        <br />
                        <Button variant="link" style={{padding: '0'}} id={i} onClick={this.currencyConvert}>{this.state.currency[i] ? 'Convert To KRW' : 'Convert To USD'}</Button>
                    </Card.Text>
                    
                    <Button id={i} variant='primary' onClick={this.itemAdd}>Add this stuff</Button>
                    <Card.Text>
                        <NumberFormat value={this.state.selected[i]} displayType={'text'} thousandSeparator={true} prefix="담은 개수: " suffix="개" />
                    </Card.Text>
                    <Button id={i} variant='secondary' onClick={this.itemRemove}>Remove this stuff</Button>
                </Card.Body>
                </Card>
            </Col>
            );
        }
        console.log(cards);
        return cards;
    }

    render() {
        let itemlist = [];
        let sellist = [];
        return (
            <div>
                <Query query={GET_ITEMS_QUERY}
                       onCompleted={data => {
                           const selected = [];
                           const currency = [];
                           for(let i = 0; i < data.getItems.length; i++) {
                               selected.push(data.getItems[i].select);
                               currency.push(false);
                           }
                           this.setState({
                               items: data.getItems,
                               currency: currency,
                               selected: selected,
                           });
                       }}>
                    {({loading, error, data}) => {
                        if (loading) return "Loading...";
                        if (error) return `Error! ${error.message}`;
                        return <div/> ;
                    }}
                </Query>
                <Container>
                    <Row>
                        <this.itemCard />
                    </Row>
                </Container>
            </div>
        );
    }
}

export default ItemList;
