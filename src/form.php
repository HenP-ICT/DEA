<?php
    if ($_SERVER["REQUEST_METHOD"] == "POST") {

        $organisation = '-';
        $email = $_POST['email'];
        $name = $_POST['name'];
        $question = $_POST['question'];

        if(isset($_POST['organisation'])) {
            $organisation = $_POST['organisation'];
        }

        //CHANGE HERE FOR DEV
        $to =           'info@wisselwerkers,mc@henp.nl';
        // $to =           'felix@canvasheroes.com';
        $subject =      'Contact Request from ' . $name;
        $message =      '<b>Contact request from:</b></br></br>' .
                        '<b>Name: </b>' . $name . '</br>'  .
                        '<b>E-Mail: </b>' . $email . '</br>'  .
                        '<b>Organisation: </b>' . $organisation . '</br>' .
                        '<b>Question: </b>' . $question . '</br>';
        $headers =      'FROM: contact-form@canvasheroes.com' . "\r\n" .
                        'Reply-To: ' . $email . "\r\n" .
                        "Content-type: text/html; charset=\"UTF-8\"; format=flowed \r\n" .
                        'X-Mailer: PHP/' . phpversion();

        $result = mail($to, $subject, $message, $headers);
        echo json_encode($result);
    }
?>